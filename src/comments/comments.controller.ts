import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import {
  NestResponseBaseOption,
  ParameterizedRoutParams,
} from 'src/interfaces/baseOption';
import { CommentInterface } from 'src/interfaces/comment';
import { Comment } from 'src/schemas/comment.schema';
import { ObjectId } from 'src/schemas/userPost.schema';
import { UserPostService } from 'src/userPosts/userPosts.service';
import { CommentService } from './comments.service';

type CreateCommentRequestBody = {
  commentDocId?: string;
  newComment: CommentInterface;
};

@Controller('posts/:postDocId/comments')
export class CommentsController {
  /**
   * 實踐之事項：
   * 1.對留言 crud 以後，必須重新計算該對應 post 裡面 totalCommentCount 的數量
   *  - find documents with same post id, do projection, and count
   *  - minify db I/O
   * 2. TODO: 需要釐清是否顯示的問題，
   * 例如若貼文刪除後，或是留言串串主刪留言後，
   * 是否仍會顯示底下的留言
   */
  constructor(
    private readonly commentService: CommentService,
    private readonly userPostServce: UserPostService,
  ) {}
  @Post()
  async createComment(
    @Body() reqBody: CreateCommentRequestBody,
    @Param() params: ParameterizedRoutParams,
  ): Promise<NestResponseBaseOption> {
    const { postDocId } = params;

    const { commentDocId, newComment } = reqBody;

    // TODO: implement target comment and linked comments
    const comment: CommentInterface = {
      ...newComment,
      targetPostId: new ObjectId(postDocId),
      targetCommentId: new ObjectId(commentDocId),
    };

    try {
      const createdComment = await this.commentService.createComment(comment);

      // update userPost total comment counts
      const filter: FilterQuery<Comment> = {
        targetPostId: new ObjectId(postDocId),
      };

      const select = { _id: 1 };

      const newTotalComments = await this.commentService.getComments({
        filter,
        select,
      });

      const postDocFilter = { _id: postDocId };
      const postDocUpdate = { totalCommentCount: newTotalComments.length };

      await this.userPostServce.updatePost({
        filter: postDocFilter,
        update: postDocUpdate,
      });

      // update linked comments in target comment
      const commentDocFilter = { _id: commentDocId };
      const targetComment = await this.commentService.getCommentById(
        commentDocId,
      );
      const originalLinkedComments = targetComment?.linkedComments || [];
      const commentDocUpdate = {
        linkedComments: [
          ...originalLinkedComments,
          new ObjectId(createdComment._id),
        ],
      };
      await this.commentService.updateComment({
        filter: commentDocFilter,
        update: commentDocUpdate,
      });

      const res: NestResponseBaseOption = {
        success: true,
        data: createdComment,
      };

      return res;
    } catch (error) {
      console.error(error);

      // TODO: better handling?
      const isValidationError =
        error instanceof Error && error.name.includes('ValidationError');

      if (isValidationError) {
        console.error(error);
        throw new BadRequestException(`${error.name}\n${error.message}`);
      }

      throw new HttpException(
        JSON.stringify(error),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getAllCommentsByPost(@Param() params: ParameterizedRoutParams) {
    const { postDocId } = params;

    const filter: FilterQuery<Comment> = {
      targetPostId: new ObjectId(postDocId),
    };

    const posts = await this.commentService.getComments({ filter });

    const res: NestResponseBaseOption = {
      success: true,
      pagination: {
        page: 1,
        count: posts.length,
      },
      data: posts,
    };
    return res;
  }

  // TODO: reconsider, maybe this is for all comments under a certain comment
  @Get('/:commentDocId')
  async getSingleComment(@Param() params: ParameterizedRoutParams) {
    const { commentDocId } = params;

    const post = await this.commentService.getCommentById(commentDocId);

    if (!post) {
      throw new HttpException(
        `${commentDocId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const res: NestResponseBaseOption = {
      success: true,
      data: post,
    };
    return res;
  }
}
