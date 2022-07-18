import { TObjectId } from 'src/schemas/userPost.schema';

export interface CommentInterface {
  /** 使用者 doc id */
  userId?: TObjectId;
  /** 針對的貼文 doc id */
  targetPostId: TObjectId;
  /** 針對的留言 doc id */
  targetCommentId?: TObjectId;
  /** 留言內容 */
  commentContent: string;
  /** 連結的子留言 */
  // TODO: maybe we don't need this field
  linkedComments: TObjectId[];
}
