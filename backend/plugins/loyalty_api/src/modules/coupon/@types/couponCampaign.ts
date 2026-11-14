import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';
import { ICommonCampaignDocument, ICommonCampaignFields } from '~/utils';

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

/** What the campaign form stores in `codeRule` in place of size, prefix, postfix and charSet. */
export interface ICouponCodeRuleFormFields {
  numberOfCodes?: number;
  prefixUppercase?: string;
  postfixUppercase?: string;
  characterSet?: string;
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
  extends ICouponCampaign, ICommonCampaignDocument, Document {
  _id: string;
}

export interface ICouponCampaignParams extends ICursorPaginateParams {
  searchValue?: string;
  status?: string;
}
