import { Document } from 'mongoose';
import { LOYALTY_CONDITIONS, STATUSES } from '~/@types';

/**
 * Coupon code generation rules
 */
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

/**
 * Coupon campaign base fields
 */
export interface ICouponCampaign {
  name: string;
  description?: string;

  status: STATUSES;

  kind: 'amount' | 'percent';
  value: number;

  codeRule: ICouponCodeRule;
  restrictions?: LOYALTY_CONDITIONS;

  redemptionLimitPerUser: number;
  buyScore: number;

  createdBy?: string;
  updatedBy?: string;
}

/**
 * Coupon campaign mongoose document
 */
export interface ICouponCampaignDocument
  extends ICouponCampaign,
    Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
