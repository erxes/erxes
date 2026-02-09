import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonDocument } from '~/utils';

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

export interface ICouponDocument extends ICoupon, ICommonDocument, Document {
  _id: string;
}

export interface ICouponParams extends ICursorPaginateParams {
  campaignId?: string;
  ownerId?: string;
  ownerType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}

export interface ICouponInput {
  campaignId: string;
  customConfig?: Array<{
    usageLimit: number;
    redemptionLimitPerUser: number;
  }>;
}
