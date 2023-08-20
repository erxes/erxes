import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IExportHistory {
  total: number;
  status?: string;
  exportLink?: string;
  contentType: string;
  columnsConfig: string[];
  segmentData: string[];
  name?: string;
  percentage?: number;
  uploadType?: string;
  errorMsg?: string;
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
  exportLink: field({ type: String, label: 'Content type' }),
  uploadType: field({ type: String, label: 'Upload Service Type' }),
  segmentData: field({ type: Object, label: 'Segment data' }),
  userId: field({ type: String, label: 'Created by' }),
  date: field({ type: Date, label: 'Date of export' }),
  status: field({
    type: String,
    default: 'inProcess',
    label: 'Status'
  }),
  percentage: field({ type: Number, default: 0, label: 'Percentage' }),
  errorMsg: field({
    type: String,
    label: 'Error Msgs'
  }),
  total: field({ type: Number, label: 'Total attempts' }),
  name: field({ type: String, label: 'Export name' })
});
