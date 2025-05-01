import { Schema, Document } from 'mongoose';
import {
  commonCampaignSchema,
  ICommonCampaignDocument,
  ICommonCampaignFields,
} from './common';

export interface ICouponCodeRule {
  prefix?: string;
  postfix?: string;
  codeLength?: number;
  usageLimit?: number;
  size?: number;
  redemptionLimitPerUser?: number;
  staticCode?: string;
  charSet?: string[];
  pattern?: string;
}

export interface ICouponCampaign extends ICommonCampaignFields {
  kind: 'amount' | 'percent';
  value: number;
  codeRule: ICouponCodeRule;
  restrictions: any;
  redemptionLimitPerUser: number;

  buyScore: number;
}

export interface ICouponCampaignDocument
  extends ICouponCampaign,
    ICommonCampaignDocument,
    Document {
  _id: string;
}

export const couponCampaignSchema = new Schema({
  ...commonCampaignSchema,

  kind: {
    type: String,
    enum: ['amount', 'percent'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  codeRule: {
    type: Schema.Types.Mixed,
  },
  restrictions: {
    type: Schema.Types.Mixed,
  },
  redemptionLimitPerUser: { type: Number, min: 1, default: 1 },

  buyScore: { type: Number, min: 0 },
});
