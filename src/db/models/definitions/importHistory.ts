import { Document, Schema } from 'mongoose';
import { field } from '../utils';

export interface IImportHistory {
  success: number;
  failed: number;
  total: number;
  ids: string[];
  contentType: string;
  errorMsgs?: string[];
  status?: string;
  percentage?: number;
}

export interface IImportHistoryDocument extends IImportHistory, Document {
  _id: string;
  userId: string;
  date: Date;
}

export const importHistorySchema = new Schema({
  _id: field({ pkey: true }),
  success: field({ type: Number, default: 0 }),
  failed: field({ type: Number, default: 0 }),
  total: field({ type: Number }),
  ids: field({ type: [String], default: [] }),
  contentType: field({ type: String }),
  userId: field({ type: String }),
  date: field({ type: Date }),
  errorMsgs: field({ type: [String], default: [] }),
  status: field({ type: String, default: 'In Progress' }),
  percentage: field({ type: Number, default: 0 }),
});
