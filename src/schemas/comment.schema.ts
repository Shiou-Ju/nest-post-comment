import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId, TObjectId } from './userPost.schema';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: ObjectId })
  /** 使用者 doc id */
  userId: TObjectId;
  /** 針對的貼文 doc id */
  @Prop({ type: ObjectId, required: true })
  targetPostId: TObjectId;
  /** 針對的留言 doc id */
  @Prop({ type: ObjectId })
  targetCommentId: TObjectId;
  /** 留言內容 */
  @Prop({ required: true })
  commentContent: string;
  /** 連結的子留言 */
  @Prop({ type: ObjectId })
  linkedComments: TObjectId[];
  @Prop()
  createdAt: Date;
  @Prop()
  updatedAt: Date;
}

// TODO: see if original API works
// CommentSchema = new mongoose.Schema<Comment>({
//   /** 使用者 doc id */
//   userId: String,
//   /** 針對的貼文 doc id */
//   targetPostId: String,
//   /** 針對的留言 doc id */
//   targetCommentId: String,
//   /** 留言內容 */
//   commentContent: String,
//   /** 連結的子留言 */
//   linkedComments: Array<ObjectId>,
// });

export const CommentSchema = SchemaFactory.createForClass(Comment);
