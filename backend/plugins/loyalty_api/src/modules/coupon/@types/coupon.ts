import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { LOYALTY_CONDITIONS, OWNER_TYPES, STATUSES } from '~/@types';

export interface ICoupon {
  campaignId: string;

  ownerId: string;
  ownerType: OWNER_TYPES;

  code: string;
  status: STATUSES;

  createdBy?: string;
  updatedBy?: string;

  conditions?: LOYALTY_CONDITIONS;
}

export interface ICouponDocument extends ICoupon, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface ICouponParams extends ICursorPaginateParams {
  campaignId?: string;
  ownerId?: string;
  ownerType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}
