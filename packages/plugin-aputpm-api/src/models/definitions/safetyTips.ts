import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface ISafetyTip {
  name: string;
  description: string;
  branchIds: string[];
  kbCategoryId: string[];
  status: string;
}

export interface ISafetyTipDocument extends ISafetyTip, Document {
  _id: string;
}

export const safetyTipsSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, label: 'Description' }),
  branchIds: field({ type: [String], label: 'Branches' }),
  kbCategoryId: field({ type: String, label: 'Kb category' }),
  status: field({
    type: String,
    label: 'Status',
    enum: ['active', 'deleted', 'draft']
  }),
  createdAt: field({ type: Date, label: 'Created at' })
});
