import { FilterQuery, Model, SortValues } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserPost, UserPostDocument } from 'src/schemas/userPost.schema';

@Injectable()
export class UserPostService {
  constructor(
    @InjectModel(UserPost.name) private userPostModel: Model<UserPostDocument>,
  ) {}

  async create(newPost: unknown): Promise<UserPost> {
    const createdUserPost = new this.userPostModel(newPost);
    createdUserPost.createdAt = new Date();
    createdUserPost.updatedAt = new Date();
    // TODO: return lean doc
    return createdUserPost.save();
  }

  async getPosts(props?: {
    filter?: FilterQuery<UserPost>;
    sort?: { [key in keyof Partial<UserPost>]: SortValues };
    limit?: number;
  }): Promise<UserPost[]> {
    return this.userPostModel
      .find(props.filter)
      .sort(props.sort)
      .limit(props.limit)
      .lean();
  }
}
