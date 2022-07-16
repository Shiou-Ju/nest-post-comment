import { ObjectId } from 'mongoose';

export interface UserPostInterFace {
  /** 使用者 doc id */
  userId?: ObjectId;
  /** 貼文內容 */
  postContent: string;
  /** 留言串 doc ids */
  comments: Array<ObjectId>;
  /** 貼文底下的留言總數，包含留言的留言 */
  totalCommentCount: number;
}
