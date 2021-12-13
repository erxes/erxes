import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IImportHistory {
  success: number;
  failed: number;
  total: number;
  contentTypes: string;
  status?: string;
  percentage?: number;
  attachments: any;
  name: string;
}

export interface IImportHistoryDocument extends IImportHistory, Document {
  _id: string;
  userId: string;
  date: Date;
  errorMsgs: string[];
  erros: object[];
}

export const importHistorySchema = new Schema({
  _id: field({ pkey: true }),
  success: field({ type: Number, default: 0, label: 'Successful attempts' }),
  failed: field({ type: Number, default: 0, label: 'Failed attempts' }),
  total: field({ type: Number, label: 'Total attempts' }),
  contentTypes: field({ type: [String], label: 'Content type' }),
  userId: field({ type: String, label: 'Created by' }),
  date: field({ type: Date, label: 'Date of import' }),
  errorMsgs: field({ type: [String], default: [], label: 'Error messages' }),
  status: field({ type: String, default: 'In Progress', label: 'Status' }),
  name: field({ type: String, label: 'Name' }),
  percentage: field({ type: Number, default: 0, label: 'Percentage' }),
  erros: field({ type: [Object] }),

  attachments: field({ type: Object, label: 'Attachments' })
});
