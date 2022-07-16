import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
// import { InjectConnection } from '@nestjs/mongoose';
// import { Connection } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserPost, UserPostDocument } from 'src/schemas/userPost.schema';

@Injectable()
export class UserPostService {
  constructor(
    @InjectModel(UserPost.name) private userPostModel: Model<UserPostDocument>, // TODO: // @InjectConnection() private connection: Connection,
  ) {}

  async create(newPost: unknown): Promise<UserPost> {
    const createdUserPost = new this.userPostModel(newPost);
    createdUserPost.createdAt = new Date();
    createdUserPost.updatedAt = new Date();
    return createdUserPost.save();
  }

  async findAll(): Promise<UserPost[]> {
    return this.userPostModel.find().exec();
  }
}
