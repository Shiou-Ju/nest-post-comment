import { ObjectId } from 'mongoose';

export interface BaseOption {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
