import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { NestResponseBaseOption } from 'src/interfaces/baseOption';
import { UserPostInterFace } from 'src/interfaces/userPost';
import { UserPostService } from './userPosts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly userPostService: UserPostService) {}
  @Get()
  async getAllPosts(): Promise<NestResponseBaseOption> {
    const posts = await this.userPostService.getPosts();

    const res: NestResponseBaseOption = {
      success: true,
      data: posts,
    };
    return res;
  }

  @Get('/top10')
  async getTopTenPosts(): Promise<NestResponseBaseOption> {
    const topPosts = await this.userPostService.getPosts({
      sort: { totalCommentCount: -1 },
      limit: 10,
    });

    const res: NestResponseBaseOption = {
      success: true,
      data: topPosts,
    };
    return res;
  }

  @Post()
  async createPost(
    @Body() newPost: UserPostInterFace,
  ): Promise<NestResponseBaseOption> {
    try {
      newPost.totalCommentCount = 0;

      const createdPost = await this.userPostService.create(newPost);

      const res = {
        success: true,
        data: createdPost,
      };

      return res;
    } catch (error) {
      // TODO: better handling?
      const isValidationError =
        error instanceof Error && error.name.includes('ValidationError');

      if (isValidationError) {
        console.error(error);
        throw new BadRequestException(`${error.name}\n${error.message}`);
      }
    }
  }
}
