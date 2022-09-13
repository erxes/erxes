import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IExportHistory {
  success: number;
  total: number;
  contentType: string;
  status?: string;
  percentage?: number;
  attachments: any;
  name: string;
  removed?: string[];
}

export interface IExportHistoryDocument extends IExportHistory, Document {
  _id: string;
  userId: string;
  date: Date;
  errorMsgs: object[];
  ids: string[];
  error: string;
}

export const exportHistorySchema = new Schema({
  _id: field({ pkey: true }),
  success: field({ type: Number, default: 0, label: 'Successful attempts' }),
  total: field({ type: Number, label: 'Total attempts' }),
  contentType: field({ type: String, label: 'Content type' }),
  userId: field({ type: String, label: 'Created by' }),
  date: field({ type: Date, label: 'Date of import' }),
  status: field({ type: String, default: 'In Progress', label: 'Status' }),
  name: field({ type: String, label: 'Name' }),
  percentage: field({ type: Number, default: 0, label: 'Percentage' }),
  errorMsgs: field({ type: [Object] }),
  removed: field({ type: [String] }),
  ids: field({ type: [String] }),

  attachments: field({ type: Object, label: 'Attachments' }),
  error: field({ type: String })
});
