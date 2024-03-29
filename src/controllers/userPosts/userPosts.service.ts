import { FilterQuery, Model, SortValues, UpdateQuery } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserPost, UserPostDocument } from 'src/schemas/userPost.schema';
import { UserPostInterFace } from 'src/interfaces/userPost';
import { DeleteResult } from 'src/interfaces/baseOption';

@Injectable()
export class UserPostService {
  constructor(
    @InjectModel(UserPost.name) private userPostModel: Model<UserPostDocument>,
  ) {}

  async createPost(newPost: UserPostInterFace): Promise<UserPost> {
    const createdUserPost = new this.userPostModel(newPost);
    // TODO: return lean doc
    return createdUserPost.save();
  }

  async getPostById(_id: string): Promise<UserPost> {
    return this.userPostModel.findOne({ _id }).lean();
  }

  async deletePost(props?: { _id: string }): Promise<DeleteResult> {
    return this.userPostModel.deleteOne({ _id: props._id });
  }

  async getPosts(
    props: {
      filter?: FilterQuery<UserPost>;
      sort?: { [key in keyof Partial<UserPost>]: SortValues };
      limit?: number;
    } = {},
  ): Promise<UserPostDocument[]> {
    const { filter, sort, limit } = props;

    return (
      this.userPostModel
        .find(filter || {})
        .sort(sort || {})
        // TODO: maybe add pagination here
        .limit(limit || 50)
        .lean()
    );
  }

  async updatePost(props: {
    filter?: FilterQuery<UserPost>;
    update?: UpdateQuery<UserPostInterFace>;
  }): Promise<UserPostDocument> {
    const model = this.userPostModel;
    const { filter, update } = props;

    return await model
      .findOneAndUpdate(filter, update, {
        new: true,
      })
      .lean();
  }
}
