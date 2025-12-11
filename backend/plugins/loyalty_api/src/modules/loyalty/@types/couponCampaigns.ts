import { Schema, Document } from 'mongoose';
import { ICommonCampaignDocument, ICommonCampaignFields } from './common';

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
