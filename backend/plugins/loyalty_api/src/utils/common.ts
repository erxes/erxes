import { Schema } from 'mongoose';
import { randomBytes } from 'node:crypto';
import { CAMPAIGN_STATUS, OWNER_TYPES } from '~/constants';

export const randomBetween = (min: number, max: number) => {
  const rand = randomBytes(4).readUInt32BE(0) / 0xffffffff;
  return rand * (max - min) + min;
};

export interface IProductD {
  productId: string;
  quantity: number;
  unitPrice: number;
}

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
  staticCode?: string;
}

export interface ICommonCampaignFields {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  finishDateOfUse?: Date;
  attachments?: any[];
  status: string;
}

export interface ICommonCampaignDocument {
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface ICommonDocument {
  createdAt?: Date;
  updatedAt?: Date;
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
  sortField?: string;
  sortDirection?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  perPage?: number;
  campaignId?: string;
  action?: string;
  number?: string;
  stageId?: string;
}

export const attachmentSchema = new Schema(
  {
    name: String,
    url: String,
    type: String,
    size: Number,
    duration: Number,
  },
  { _id: false },
);

/* =======================
   Common document fields
   ======================= */

export interface ICommonFields {
  campaignId: string;

  ownerId: string;
  ownerType: string;

  usedAt?: Date;
  userId?: string;
}

export const commonCampaignSchema = {
  createdAt: { type: Date },
  createdBy: { type: String },
  modifiedAt: { type: Date },
  modifiedBy: { type: String },

  title: { type: String, required: true },
  description: { type: String },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  finishDateOfUse: { type: Date },

  attachments: {
    type: [attachmentSchema],
    default: [],
  },

  status: {
    type: String,
    enum: CAMPAIGN_STATUS.ALL,
    default: CAMPAIGN_STATUS.ACTIVE,
  },
};

export const commonSchema = {
  campaignId: { type: String, required: true },

  usedAt: { type: Date },
  userId: { type: String },

  ownerId: { type: String, required: true },
  ownerType: { type: String, enum: OWNER_TYPES.ALL, required: true },
};

export const commonCampaignTypes = `
  createdAt: Date,
  createdBy: String,
  modifiedAt: Date,
  modifiedBy: String,

  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  finishDateOfUse: Date,
  attachment: Attachment,

  status: String,
`;

export const commonCampaignInputs = `
  title: String,
  description: String,
  startDate: Date,
  endDate: Date,
  finishDateOfUse: Date,
  numberFormat:String,
  attachment: AttachmentInput,
  status: String,
`;

export const paginateTypes = `
  page: Int,
  perPage: Int,
  sortField: String,
  sortDirection: Int,
`;

export const commonFilterTypes = `
  _ids: [String],
  searchValue: String,
  filterStatus: String,
`;

export const commonTypes = `
  _id: String,
  campaignId: String,
  createdAt: Date,
  usedAt: Date,
  voucherCampaignId: String,

  ownerType: String,
  ownerId: String,

  owner: JSON
`;

export const commonInputs = `
  campaignId: String,
  usedAt: Date,

  ownerType: String,
  ownerId: String,
`;

export const commonFilters = `
  ${paginateTypes}

  searchValue: String,
  campaignId: String,
  ownerType: String,
  ownerId: String,
  status: String,
`;
