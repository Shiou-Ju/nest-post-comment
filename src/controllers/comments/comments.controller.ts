import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { FilterQuery, UpdateQuery } from 'mongoose';
import {
  NestResponseBaseOption,
  ParameterizedRoutParams,
} from 'src/interfaces/baseOption';
import { CommentInterface } from 'src/interfaces/comment';
import { Comment, CommentDocument } from 'src/schemas/comment.schema';
import { ObjectId, TObjectId, UserPost } from 'src/schemas/userPost.schema';
import { UserPostService } from 'src/controllers/userPosts/userPosts.service';
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

    const isPostExisting = await this.userPostServce.getPostById(postDocId);

    if (!isPostExisting) {
      throw new NotFoundException(`Post document ${postDocId} not found`);
    }

    if (commentDocId) {
      const targetComment = await this.commentService.getCommentById(
        commentDocId,
      );

      if (!targetComment) {
        throw new NotFoundException(
          `targetComment not found with id: ${commentDocId} `,
        );
      }
    }

    const comment: CommentInterface = {
      ...newComment,
      targetPostId: new ObjectId(postDocId),
      targetCommentId: commentDocId ? new ObjectId(commentDocId) : undefined,
    };

    if (!comment.commentContent) {
      throw new BadRequestException(`commentContent is not provided`);
    }

    const createdComment = await this.commentService.createComment(comment);

    // update userPost total comment counts
    await this.updateTargetPost(postDocId, commentDocId);

    // update linked comments in target comment
    if (commentDocId) {
      await this.updateTargetComment(commentDocId, createdComment);
    }

    const res: NestResponseBaseOption = {
      success: true,
      data: createdComment,
    };

    return res;
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

  @Get('/:commentDocId')
  async getAllCommentsByParantComment(
    @Param() params: ParameterizedRoutParams,
  ) {
    const { commentDocId } = params;

    const filter: FilterQuery<CommentDocument> = {
      targetCommentId: new ObjectId(commentDocId),
    };

    const posts = await this.commentService.getComments({ filter });

    const res: NestResponseBaseOption = {
      success: true,
      data: posts,
    };
    return res;
  }

  // TODO: only supports modifying comment content
  @Put('/:commentDocId')
  async updateComment(
    @Body()
    updateComment: CommentInterface,
    @Param() params: ParameterizedRoutParams,
  ) {
    const { commentDocId } = params;

    if (!commentDocId) {
      throw new BadRequestException('Comment document id is not provided');
    }

    const existingDoc = await this.commentService.getCommentById(commentDocId);

    if (!existingDoc) {
      throw new NotFoundException(`${commentDocId} comment not found`);
    }

    const filter: FilterQuery<CommentInterface> = { _id: commentDocId };
    const update: UpdateQuery<CommentInterface> = updateComment;

    // TODO: still updates updatedAt, make sure if this satisfies needs
    const updatedComment = await this.commentService.updatePost({
      filter,
      update,
    });

    const res = {
      success: true,
      data: updatedComment,
    };

    return res;
  }

  private async updateTargetPost(
    postDocId: string,
    commentDocId: string | undefined,
  ) {
    const filter: FilterQuery<Comment> = {
      targetPostId: new ObjectId(postDocId),
    };
    const select = { _id: 1 };

    const newTotalComments = await this.commentService.getComments({
      filter,
      select,
    });

    const postDocFilter = { _id: postDocId };
    const update: UpdateQuery<UserPost> = {
      totalCommentCount: newTotalComments.length,
      $addToSet: commentDocId ? {} : { comments: new ObjectId(commentDocId) },
    };

    return await this.userPostServce.updatePost({
      filter: postDocFilter,
      update,
    });
  }

  private async updateTargetComment(
    commentDocId: string,
    createdComment: Comment & { _id: TObjectId },
  ) {
    const commentDocFilter = { _id: commentDocId };

    const commentDocUpdate: UpdateQuery<Comment> = {
      $addToSet: { linkedComments: new ObjectId(createdComment._id) },
    };

    return await this.commentService.updateComment({
      filter: commentDocFilter,
      update: commentDocUpdate,
    });
  }
}
