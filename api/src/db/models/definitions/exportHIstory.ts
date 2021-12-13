import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IExportHistory {
  success: number;
  failed: number;
  total: number;
  contentTypes: string;
  status?: string;
  percentage?: number;
  attachments: any;
}

export interface IExportHistoryDocument extends IExportHistory, Document {
  _id: string;
  userId: string;
  date: Date;
  errorMsgs: string[];
  erros: object[];
}

export const exportHistorySchema = new Schema({
  _id: field({ pkey: true }),
  success: field({ type: Number, default: 0, label: 'Successful attempts' }),
  failed: field({ type: Number, default: 0, label: 'Failed attempts' }),
  total: field({ type: Number, label: 'Total attempts' }),
  contentTypes: field({ type: [String], label: 'Content type' }),
  userId: field({ type: String, label: 'Created by' }),
  date: field({ type: Date, label: 'Date of import' }),
  errorMsgs: field({ type: [String], default: [], label: 'Error messages' }),
  status: field({ type: String, default: 'In Progress', label: 'Status' }),
  percentage: field({ type: Number, default: 0, label: 'Percentage' }),
  erros: field({ type: [Object] }),

  attachments: field({ type: Object, label: 'Attachments' })
});
