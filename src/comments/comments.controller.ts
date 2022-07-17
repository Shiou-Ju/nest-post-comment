import { Controller } from '@nestjs/common';

@Controller('comments')
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
}
