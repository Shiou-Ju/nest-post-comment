import { FilterQuery, Model, SortValues, UpdateQuery } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserPost, UserPostDocument } from 'src/schemas/userPost.schema';
import { UserPostInterFace } from 'src/interfaces/userPost';

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

  async getPosts(props?: {
    filter?: FilterQuery<UserPost>;
    sort?: { [key in keyof Partial<UserPost>]: SortValues };
    limit?: number;
  }): Promise<UserPostDocument[]> {
    return this.userPostModel
      .find(props.filter)
      .sort(props.sort)
      .limit(props.limit)
      .lean();
  }

  async updatePost(props: {
    filter?: FilterQuery<UserPost>;
    update?: UpdateQuery<UserPostInterFace>;
  }): Promise<UserPostDocument> {
    const model = this.userPostModel;
    return await model
      .findOneAndUpdate(props.filter, props.update, {
        new: true,
        upsert: true,
      })
      .lean();
  }
}
