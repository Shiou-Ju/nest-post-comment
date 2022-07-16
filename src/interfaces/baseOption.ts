import { ObjectId, Document } from 'mongoose';

export interface BaseOption extends Document {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
