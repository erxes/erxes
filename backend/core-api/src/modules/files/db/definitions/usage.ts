import { Document, Schema } from 'mongoose';

/**
 * A single document per tenant. `reservedBytes` is held from upload start so
 * parallel uploads cannot overshoot the quota between start and complete.
 */
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
