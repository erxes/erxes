import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { LOYALTY_CONDITIONS, STATUSES } from '~/@types';

export interface ICouponCampaign {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: STATUSES;

  type: string;
  amount: number;

  createdBy?: string;
  updatedBy?: string;

  conditions?: LOYALTY_CONDITIONS;
}

export interface ICouponCampaignDocument extends ICouponCampaign, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface ICouponCampaignParams extends ICursorPaginateParams {
  searchValue?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  dateField?: string;
}
