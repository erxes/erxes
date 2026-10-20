import { Document, Schema } from 'mongoose';

export interface IFileUsage {
  usedBytes: number;
  reservedBytes: number;
}

export interface IFileUsageDocument extends IFileUsage, Document<string> {
  _id: string;
}

export const fileUsageSchema = new Schema({
  _id: { type: String },
  usedBytes: { type: Number, default: 0 },
  reservedBytes: { type: Number, default: 0 },
});
