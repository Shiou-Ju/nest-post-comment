import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { FilterQuery, UpdateQuery } from 'mongoose';
import {
  ActionsForInvolvingDocumentsUpdate,
  NestResponseBaseOption,
  ParameterizedRoutParams,
} from 'src/interfaces/baseOption';
import { CommentInterface } from 'src/interfaces/comment';
import { Comment, CommentDocument } from 'src/schemas/comment.schema';
import { ObjectId, UserPost } from 'src/schemas/userPost.schema';
import { UserPostService } from 'src/controllers/userPosts/userPosts.service';
import { CommentService } from './comments.service';
import { Response } from 'express';

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

    const { commentDocId: targetCommentDocId, newComment } = reqBody;

    const isPostExisting = await this.userPostServce.getPostById(postDocId);

    if (!isPostExisting) {
      throw new NotFoundException(`Post document ${postDocId} not found`);
    }

    if (targetCommentDocId) {
      const targetComment = await this.commentService.getCommentById(
        targetCommentDocId,
      );

      if (!targetComment) {
        throw new NotFoundException(
          `targetComment not found with id: ${targetCommentDocId} `,
        );
      }

      const hasTargetCommentInPost =
        targetComment.targetPostId.toString() === postDocId;
      if (!hasTargetCommentInPost) {
        throw new NotFoundException(
          `targetComment not found in post: ${postDocId} `,
        );
      }
    }

    const comment: CommentInterface = {
      ...newComment,
      targetPostId: new ObjectId(postDocId),
      targetCommentId: targetCommentDocId
        ? new ObjectId(targetCommentDocId)
        : undefined,
    };

    if (!comment.commentContent) {
      throw new BadRequestException(`commentContent is not provided`);
    }

    const createdComment = await this.commentService.createComment(comment);

    // update userPost total comment counts
    await this.updateTargetPost(
      postDocId,
      targetCommentDocId ? undefined : createdComment._id.toString(),
      'create',
    );

    // update linked comments in target comment
    if (targetCommentDocId) {
      await this.updateTargetComment(
        targetCommentDocId,
        createdComment._id.toString(),
        'create',
      );
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

  @Delete('/:commentDocId')
  async deleteComment(
    @Param() params: ParameterizedRoutParams,
    @Res() response: Response,
  ) {
    const { commentDocId, postDocId } = params;

    if (!commentDocId) {
      throw new BadRequestException('Comment document id is not provided');
    }
    if (!postDocId) {
      throw new BadRequestException('Post document id is not provided');
    }

    const doc = await this.commentService.getCommentById(commentDocId);

    if (!doc) {
      response.status(HttpStatus.NO_CONTENT).send();
    } else {
      const hasTargetCommentInPost = doc.targetPostId.toString() === postDocId;
      if (!hasTargetCommentInPost) {
        throw new NotFoundException(
          `${commentDocId} is not in post ${postDocId}`,
        );
      }

      const result = await this.commentService.deleteComment({
        _id: new ObjectId(commentDocId),
      });

      if (result.deletedCount === 0) {
        response.status(HttpStatus.NO_CONTENT).send();
      } else {
        await this.updateTargetPost(
          postDocId,
          doc.targetCommentId ? undefined : commentDocId,
          'delete',
        );

        if (doc.targetCommentId) {
          await this.updateTargetComment(
            doc.targetCommentId.toString(),
            commentDocId,
            'delete',
          );
        }

        const res: NestResponseBaseOption = {
          success: true,
          data: result,
        };
        response.status(HttpStatus.OK).send(res);
      }
    }
  }

  private async updateTargetPost(
    postDocId: string,
    parentCommentDocId: string | undefined,
    action: ActionsForInvolvingDocumentsUpdate,
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
    const update: UpdateQuery<UserPost> =
      action === 'delete'
        ? {
            totalCommentCount: newTotalComments.length,
            $pull: parentCommentDocId
              ? { comments: new ObjectId(parentCommentDocId) }
              : {},
          }
        : {
            totalCommentCount: newTotalComments.length,
            $addToSet: parentCommentDocId
              ? { comments: new ObjectId(parentCommentDocId) }
              : {},
          };

    return await this.userPostServce.updatePost({
      filter: postDocFilter,
      update,
    });
  }

  private async updateTargetComment(
    targetCommentDocId: string,
    childCommentId: string | null,
    action: ActionsForInvolvingDocumentsUpdate,
  ) {
    const commentDocFilter = { _id: targetCommentDocId };

    const commentDocUpdate: UpdateQuery<Comment> =
      action === 'delete'
        ? {
            $pull: {
              linkedComments: childCommentId
                ? new ObjectId(childCommentId)
                : {},
            },
          }
        : {
            $addToSet: {
              linkedComments: childCommentId
                ? new ObjectId(childCommentId)
                : {},
            },
          };

    return await this.commentService.updateComment({
      filter: commentDocFilter,
      update: commentDocUpdate,
    });
  }
}
