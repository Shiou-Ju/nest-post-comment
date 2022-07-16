import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export const ObjectId = mongoose.Types.ObjectId;
export type TObjectId = mongoose.ObjectId;

export type UserPostDocument = UserPost & Document;

@Schema()
export class UserPost {
  @Prop({ type: ObjectId })
  /** 使用者 doc id */
  userId: TObjectId;
  @Prop({ required: true })
  /** 貼文內容 */
  postContent: string;
  @Prop({ type: [ObjectId], required: true })
  /** 留言串 doc ids */
  comments: Array<TObjectId>;
  @Prop({ required: true })
  /** 貼文底下的留言總數，包含留言的留言 */
  totalCommentCount: number;
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(UserPost);
