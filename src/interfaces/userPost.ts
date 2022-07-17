import { TObjectId } from 'src/schemas/userPost.schema';
import { BaseOption } from './baseOption';

export interface UserPostInterFace {
  /** 使用者 doc id */
  userId?: TObjectId;
  /** 貼文內容 */
  postContent: string;
  /** 留言串 doc ids */
  comments: Array<TObjectId>;
  /** 貼文底下的留言總數，包含留言的留言 */
  totalCommentCount: number;
}

export type CreatePostInterface = UserPostInterFace & BaseOption;
