import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserPostInterFace } from 'src/interfaces/userPost';
import { UserPost } from 'src/schemas/userPost.schema';
import { UserPostService } from './userPosts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly userPostService: UserPostService) {}
  @Get()
  getAllPosts(): string {
    return 'hi';
  }

  // TODO: use db service
  @Post()
  async createPost(@Body() userPost: UserPost) {
    // TODO: mock data here
    const newPost: UserPostInterFace = {
      postContent: 'testing!',
      comments: [],
      totalCommentCount: 0,
    };
    await this.userPostService.create(newPost);
  }
}
