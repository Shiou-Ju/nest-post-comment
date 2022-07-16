import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { NestResponseBaseOption } from 'src/interfaces/baseOption';
import { UserPostInterFace } from 'src/interfaces/userPost';
import { UserPostService } from './userPosts.service';

export type ParameterizedRoutParams = {
  postDocId: string;
};

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

  @Get('/:postDocId')
  async getSingleDoc(@Param() params: ParameterizedRoutParams) {
    const { postDocId } = params;

    const post = await this.userPostService.getPostById({ _id: postDocId });

    if (!post) {
      throw new HttpException(`${postDocId} not found`, HttpStatus.NOT_FOUND);
    }

    const res: NestResponseBaseOption = {
      success: true,
      data: post,
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

      const createdPost = await this.userPostService.createPost(newPost);

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

  @Put(':postDocId')
  async updatePost(
    @Body()
    updatePost: UserPostInterFace,
    @Param() params: ParameterizedRoutParams,
  ) {
    const { postDocId } = params;
    if (!postDocId) {
      throw new HttpException(
        'Post document id is not provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingDoc = await this.userPostService.getPostById({
      _id: postDocId,
    });

    if (!existingDoc) {
      throw new HttpException(`${postDocId} not found`, HttpStatus.NOT_FOUND);
    }

    const filter: FilterQuery<UserPostService> = { _id: postDocId };
    const update: UpdateQuery<UserPostInterFace> = updatePost;

    // TODO: still updates updatedAt, make sure if this satisfies needs
    const createdPost = await this.userPostService.updatePost({
      filter,
      update,
    });

    const res = {
      success: true,
      data: createdPost,
    };

    return res;
  }
}
