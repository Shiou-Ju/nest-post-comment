import { FilterQuery, Model, SortValues } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Comment, CommentDocument } from 'src/schemas/comment.schema';
import { CommentInterface } from 'src/interfaces/comment';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async createComment(newComment: CommentInterface): Promise<Comment> {
    const createdComment = new this.commentModel(newComment);
    // TODO: return lean doc
    return createdComment.save();
  }

  async getCommentById(_id: string): Promise<CommentDocument> {
    return this.commentModel.findOne({ _id });
  }

  async getComments(props?: {
    filter?: FilterQuery<Comment>;
    sort?: { [key in keyof Partial<Comment>]: SortValues };
    limit?: number;
  }): Promise<CommentDocument[]> {
    return (
      this.commentModel
        .find(props?.filter || {})
        .sort(props?.sort || {})
        // TODO: maybe add pagination here
        .limit(props?.limit || Infinity)
        .lean()
    );
  }
}
