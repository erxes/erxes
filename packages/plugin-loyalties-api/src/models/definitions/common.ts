import { Schema } from 'mongoose';
import { field } from './utils';
import { CAMPAIGN_STATUS, OWNER_TYPES } from './constants';

export interface IBuyParams {
  campaignId: string;
  ownerType: string;
  ownerId: string;
  count?: number;
}

export interface ICommonCampaignFields {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  finishDateOfUse: Date;
  attachments?: any[];

  status: string;
}

export interface ICommonCampaignDocument {
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
}

export interface ICommonCampaignParams {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;

  searchValue?: string;
  filterStatus?: string;
}

export interface ICommonParams {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;

  searchValue?: string;
  campaignId?: string;
  ownerType?: string;
  ownerId?: string;
  status?: string;
  statuses?: string[];
}

export const attachmentSchema = new Schema(
  {
    name: field({ type: String }),
    url: field({ type: String }),
    type: field({ type: String }),
    size: field({ type: Number, optional: true }),
    duration: field({ type: Number, optional: true })
  },
  { _id: false }
);

export interface ICommonFields {
  campaignId: string;
  usedAt?: Date;
  userId?: string;

  ownerType: string;
  ownerId: string;
}

export interface ICommonDocument {
  createdAt: Date;
  modifiedAt: Date;
}

export const commonCampaignSchema = {
  _id: field({ pkey: true }),

  createdAt: field({ type: Date, label: 'Created at' }),
  createdBy: field({ type: String, label: 'Created by' }),
  modifiedAt: field({ type: Date, label: 'Modified at' }),
  modifiedBy: field({ type: String, label: 'Modified by' }),

  title: field({ type: String, label: 'Title' }),
  description: field({ type: String, label: 'Description' }),
  startDate: field({ type: Date, label: 'Start Date' }),
  endDate: field({ type: Date, label: 'End Date' }),
  finishDateOfUse: field({ type: Date, label: 'Use Finsh Date' }),
  attachment: field({ type: attachmentSchema }),

  status: field({ type: String, enum: CAMPAIGN_STATUS.ALL, default: 'active' })
};

export const commonSchema = {
  _id: field({ pkey: true }),
  campaignId: field({ type: String }),
  createdAt: field({ type: Date, label: 'Created at' }),
  modifiedAt: field({ type: Date, label: 'Modified at' }),
  usedAt: field({ type: Date, label: 'Used date', optional: true }),
  userId: field({ type: String, label: 'Modified User', optional: true }),

  ownerType: field({
    type: String,
    label: 'Owner Type',
    enum: OWNER_TYPES.ALL
  }),
  ownerId: field({ type: String })
};
