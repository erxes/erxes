import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IExportHistory {
  // success: number;
  // failed: number;
  // updated: number;
  // total: number;
  // status?: string;
  // percentage?: number;
  contentType: string;
  columnsConfig: string[];
  segmentId: string;
}

export interface IExportHistoryDocument extends IExportHistory, Document {
  _id: string;
  userId: string;
  date: Date;
}

export const exportHistorySchema = new Schema({
  _id: field({ pkey: true }),
  contentType: field({ type: String, label: 'Content type' }),
  columnsConfig: field({ type: [String], label: 'Columns config' }),
  segmentId: field({ type: String, label: 'Segment Id' }),
  userId: field({ type: String, label: 'Created by' }),
  date: field({ type: Date, label: 'Date of export' })
});
