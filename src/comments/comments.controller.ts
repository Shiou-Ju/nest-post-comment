import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from '@nestjs/common';
import {
  NestResponseBaseOption,
  ParameterizedRoutParams,
} from 'src/interfaces/baseOption';
import { CommentInterface } from 'src/interfaces/comment';
import { ObjectId } from 'src/schemas/userPost.schema';
import { CommentService } from './comments.service';

@Controller('posts/:postId/comments')
export class CommentsController {
  /**
   * 實踐之事項：
   * 1.對留言 crud 以後，必須重新計算該對應 post 裡面 totalCommentCount 的數量
   *  - find documents with same post id, do projection, and count
   *  - minify db I/O
   * 2. TODO: 需要釐清是否顯示的問題，
   * 例如若貼文刪除後，或是留言串串主刪留言後，
   * 是否仍會顯示底下的留言
   */
  constructor(private readonly commentService: CommentService) {}
  @Post()
  async createPost(
    @Body() newComment: CommentInterface,
    @Param() params: ParameterizedRoutParams,
  ): Promise<NestResponseBaseOption> {
    const { postDocId } = params;

    const comment: CommentInterface = {
      ...newComment,
      targetPostId: new ObjectId(postDocId),
    };

    try {
      const createdComment = await this.commentService.createComment(comment);

      const res: NestResponseBaseOption = {
        success: true,
        data: createdComment,
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
