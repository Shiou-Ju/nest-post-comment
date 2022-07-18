import { FilterQuery, Model, SortValues, UpdateQuery } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Comment, CommentDocument } from 'src/schemas/comment.schema';
import { CommentInterface } from 'src/interfaces/comment';
import { TObjectId } from 'src/schemas/userPost.schema';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async createComment(
    newComment: CommentInterface,
  ): Promise<Comment & { _id: TObjectId }> {
    const createdComment = new this.commentModel(newComment);
    // TODO: return lean doc
    return createdComment.save();
  }

  async getCommentById(_id: string): Promise<CommentDocument> {
    return this.commentModel.findOne({ _id });
  }

  async getComments(
    props: {
      filter?: FilterQuery<Comment>;
      sort?: { [key in keyof Partial<Comment>]: SortValues };
      limit?: number;
      // TODO: Add proper type
      select?: { [key in keyof Partial<Comment> & TObjectId]: SortValues };
    } = {},
  ): Promise<CommentDocument[]> {
    const { filter, sort, limit, select } = props;

    return (
      this.commentModel
        .find(filter || {})
        .sort(sort || {})
        // TODO: maybe add pagination here
        .limit(limit || 0)
        .select(select || {})
        .lean()
    );
  }

  async updateComment(props: {
    filter?: FilterQuery<Comment>;
    update?: UpdateQuery<CommentInterface>;
  }): Promise<CommentDocument> {
    const model = this.commentModel;
    const { filter, update } = props;

    return await model
      .findOneAndUpdate(filter, update, {
        new: true,
        upsert: true,
      })
      .lean();
  }
}
