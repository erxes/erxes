import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IActivityLogInput {
  action: string;
  content?: any;
  contentType: string;
  contentId: string;
  createdBy: string;
}
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

export const activityLogSchema = new Schema({
  _id: field({ pkey: true }),
  contentId: field({ type: String, index: true }),
  contentType: field({ type: String, index: true }),
  action: field({ type: String, index: true }),
  content: Schema.Types.Mixed,
  createdBy: field({ type: String }),
  createdAt: field({
    type: Date,
    required: true,
    default: Date.now,
  }),
});
