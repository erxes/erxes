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
