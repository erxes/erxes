import { Document } from 'mongoose';

export interface ICommonAdjusting {
  date: Date;

}

export interface ICommonAdjustingDocument extends ICommonAdjusting, Document {
  _id: string;
  createdAt: Date;
}
