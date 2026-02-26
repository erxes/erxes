import { Document } from 'mongoose';

export interface IInstagramLog {
  type: string;
  value: any;
  specialValue: any;
  createdAt: Date;
}

export interface IInstagramLogInput {
  type: string;
  value: any;
  specialValue: any;
}

export interface IInstagramLogDocument extends IInstagramLog, Document {
  _id: string;
}
