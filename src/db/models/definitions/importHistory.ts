import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IImportHistory {
  success: number;
  failed: number;
  total: number;
  ids: string[];
  contentType: string;
  status?: string;
  percentage?: number;
}

export interface IImportHistoryDocument extends IImportHistory, Document {
  _id: string;
  userId: string;
  date: Date;
  errorMsgs: string[];
}

export const importHistorySchema = new Schema({
  _id: field({ pkey: true }),
  success: field({ type: Number, default: 0, label: 'Successful attempts' }),
  failed: field({ type: Number, default: 0, label: 'Failed attempts' }),
  total: field({ type: Number, label: 'Total attempts' }),
  ids: field({ type: [String], default: [], label: 'Ids' }),
  contentType: field({ type: String, label: 'Content type' }),
  userId: field({ type: String, label: 'Created by' }),
  date: field({ type: Date, label: 'Date of import' }),
  errorMsgs: field({ type: [String], default: [], label: 'Error messages' }),
  status: field({ type: String, default: 'In Progress', label: 'Status' }),
  percentage: field({ type: Number, default: 0, label: 'Percentage' }),
});
