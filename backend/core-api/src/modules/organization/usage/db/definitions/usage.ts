import { Schema, Document } from 'mongoose';

interface IUsage {
  targetType: string;
  totalCount: number;
  count: number;
  limit: number;
  recurringInterval: 'day' | 'week' | 'month';
  lastResetAt: Date;
}

export interface IUsageDocument extends IUsage, Document {
  _id: string;
}

export const usageSchema = new Schema(
  {
    targetType: {
      type: String,
      required: true,
      unique: true,
      index: true,
    } /** content type <pluginName>:<moduleName>.<collectionName> */,
    totalCount: {
      type: Number,
      required: true,
      default: 0 /** total count of entire content type */,
    },
    count: {
      type: Number,
      default: 0 /** current count. only for recurring usage */,
    },
    limit: {
      type: Number,
      optional: true /** limit of usage. set from global profile */,
    },
    recurringInterval: {
      type: String,
      enum: ['day', 'week', 'month'],
      optional: true /** recurring interval.only for recurring usage */,
    },
    lastResetAt: {
      type: Date,
      optional: true /** last reset time.only for recurring usage*/,
    },
  },
  {
    timestamps: true,
  },
);
