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
  getAllPosts(): NestResponseBaseOption {
    const res: NestResponseBaseOption = {
      success: true,
      data: [],
    };
    return res;
  }

  // TODO: use db service
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
