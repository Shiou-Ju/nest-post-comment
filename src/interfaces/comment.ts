import { ObjectId } from 'mongoose';
import { BaseOption } from './baseOption';

export interface Comment {
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

export type CommentDoc = Comment | BaseOption;
