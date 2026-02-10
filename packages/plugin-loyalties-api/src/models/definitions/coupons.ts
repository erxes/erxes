import { stringRandomId } from '@erxes/api-utils/src/mongoose-types';
import { Schema, Document } from 'mongoose';
import { CODE_STATUS } from './constants';

export interface ICoupon {
  campaignId: string;
  code: string;
  usageLimit: number;
  usageCount: number;
  status: string;
  usageLogs: Array<{
    usedDate: Date;
    ownerId: string;
    ownerType: string;
    targetId: string;
    targetType: string;
  }>;
  redemptionLimitPerUser: number;
}

export interface ICouponInput {
  campaignId: string;
  customConfig?: Array<{
    usageLimit: number;
    redemptionLimitPerUser: number;
  }>;
}

export interface ICouponDocument extends ICoupon, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const usageLogSchema = new Schema(
  {
    usedDate: {
      type: Date,
      default: Date.now,
    },
    ownerId: String,
    ownerType: String,
    targetId: String,
    targetType: String,
  },
  { _id: false },
);

export const couponSchema = new Schema(
  {
    _id: stringRandomId,

    campaignId: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    usageLimit: {
      type: Number,
      default: 1,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: CODE_STATUS.ALL,
      default: CODE_STATUS.NEW,
    },
    usageLogs: {
      type: [usageLogSchema],
      default: [],
    },
    redemptionLimitPerUser: { type: Number, min: 1 },
  },
  { timestamps: true },
);

couponSchema.index({ 'usageLogs.ownerId': 1 });
couponSchema.index({ campaignId: 1, code: 1 }, { unique: true });
