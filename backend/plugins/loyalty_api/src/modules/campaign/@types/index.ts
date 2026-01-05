import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { LOYALTY_CONDITIONS, STATUSES } from '~/@types';

export interface ICampaign {
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

  kind: string;
}

export interface ICampaignDocument extends ICampaign, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface ICampaignParams extends ICursorPaginateParams {
  searchValue?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  dateField?: string;

  kind: string;
}
