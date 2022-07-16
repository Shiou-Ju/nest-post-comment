import { ObjectId } from 'mongoose';

export interface CommentInterface {
  /** 使用者 doc id */
  userId?: ObjectId;
  /** 針對的貼文 doc id */
  targetPostId?: ObjectId;
  /** 針對的留言 doc id */
  targetCommentId?: ObjectId;
  /** 留言內容 */
  commentContent: string;
  /** 連結的子留言 */
  linkedComments: ObjectId[];
}
