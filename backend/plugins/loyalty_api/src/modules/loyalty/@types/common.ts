import { Schema } from 'mongoose';
import { CAMPAIGN_STATUS, OWNER_TYPES } from './constants';
import { field } from './utils';

export interface IBuyParams {
  campaignId: string;
  ownerType: string;
  ownerId: string;
  count?: number;
}

export interface ICodeConfig {
  campaignId: string;
  prefix?: string;
  suffix?: string;
  codeLength: number;
  usageLimit: number;
  quantity: number;
  allowRepeatRedemption: boolean;
  staticCode: string;
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
  awardId?: string;
}

export interface IScoreParams {
  ownerType: string;
  ownerId: string;
  sortField: string;
  sortDirection: string;
  fromDate: string;
  toDate: string;
  page?: number;
  perPage?: number;
  campaignId?: string;
  action?: string;
  number?: string;
  stageId?: string;
}

export const attachmentSchema = new Schema(
  {
    name: field({ type: String }),
    url: field({ type: String }),
    type: field({ type: String }),
    size: field({ type: Number, optional: true }),
    duration: field({ type: Number, optional: true }),
  },
  { _id: false },
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
