import { Document } from 'mongoose';

export interface IActivityLog {
  action: string;
  content?: any;
  contentType: string;
  contentId: string;
  createdBy: string;
}

export interface IActivityLogDocument extends IActivityLog, Document {
  _id: string;
  createdAt: Date;
}
