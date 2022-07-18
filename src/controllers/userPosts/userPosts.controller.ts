import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FilterQuery, UpdateQuery } from 'mongoose';
import {
  NestResponseBaseOption,
  ParameterizedRoutParams,
} from 'src/interfaces/baseOption';
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
      pagination: {
        page: 1,
        count: posts.length,
      },
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
      pagination: {
        page: 1,
        count: topPosts.length,
      },
      data: topPosts,
    };
    return res;
  }

  @Post()
  async createPost(
    @Body() newPost: UserPostInterFace,
  ): Promise<NestResponseBaseOption> {
    const { postContent } = newPost;

    if (!postContent) {
      throw new BadRequestException('postContent is not provided');
    }

    newPost.totalCommentCount = 0;

    const createdPost = await this.userPostService.createPost(newPost);

    const res: NestResponseBaseOption = {
      success: true,
      data: createdPost,
    };

    return res;
  }

  @Get('/:postDocId')
  async getSinglePost(@Param() params: ParameterizedRoutParams) {
    const { postDocId } = params;

    const post = await this.userPostService.getPostById(postDocId);

    if (!post) {
      throw new HttpException(`${postDocId} not found`, HttpStatus.NOT_FOUND);
    }

    const res: NestResponseBaseOption = {
      success: true,
      data: post,
    };
    return res;
  }

  @Delete('/:postDocId')
  async deletePost(
    @Param() params: ParameterizedRoutParams,
    @Res() response: Response,
  ) {
    const { postDocId } = params;

    const result = await this.userPostService.deletePost({ _id: postDocId });

    if (result.deletedCount === 0) {
      response.status(HttpStatus.NO_CONTENT).send();
    } else {
      const res: NestResponseBaseOption = {
        success: true,
        data: result,
      };
      response.status(HttpStatus.OK).send(res);
    }
  }

  @Put('/:postDocId')
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

    const existingDoc = await this.userPostService.getPostById(postDocId);

    if (!existingDoc) {
      throw new HttpException(`${postDocId} not found`, HttpStatus.NOT_FOUND);
    }

    const filter: FilterQuery<UserPostService> = { _id: postDocId };
    const update: UpdateQuery<UserPostInterFace> = updatePost;

    // TODO: still updates updatedAt, make sure if this satisfies needs
    const updatedPost = await this.userPostService.updatePost({
      filter,
      update,
    });

    const res = {
      success: true,
      data: updatedPost,
    };

    return res;
  }
}
