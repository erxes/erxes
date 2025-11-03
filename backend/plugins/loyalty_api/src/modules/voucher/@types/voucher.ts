import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { LOYALTY_CONDITIONS, OWNER_TYPES, STATUSES } from '~/@types';

export interface IVoucher {
  campaignId: string;

  ownerId: string;
  ownerType: OWNER_TYPES;

  status?: STATUSES;

  createdBy?: string;
  updatedBy?: string;

  conditions?: LOYALTY_CONDITIONS;
}

export interface IVoucherDocument extends IVoucher, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IVoucherParams extends ICursorPaginateParams {
  campaignId?: string;
  ownerId?: string;
  ownerType?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
}
