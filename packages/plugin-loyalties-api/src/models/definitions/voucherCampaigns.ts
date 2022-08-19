import { Document, Schema } from 'mongoose';
import { field } from './utils';
import {
  commonCampaignSchema,
  ICommonCampaignFields,
  ICommonCampaignDocument
} from './common';

export interface IVoucherCampaign extends ICommonCampaignFields {
  buyScore: number;

  score: number;
  scoreAction: string;

  voucherType: string;

  productCategoryIds: string[];
  productIds: string[];
  discountPercent: number;

  bonusProductId: string;
  bonusCount: number;

  coupon: string;

  spinCampaignId: string;
  spinCount: number;

  lotteryCampaignId: string;
  lotteryCount: number;
}

export interface IVoucherCampaignDocument
  extends IVoucherCampaign,
    ICommonCampaignDocument,
    Document {
  _id: string;
}

export const voucherCampaignSchema = new Schema({
  ...commonCampaignSchema,

  buyScore: field({ type: Number }),

  score: field({ type: Number }),
  scoreAction: field({ type: String }),

  voucherType: field({ type: String }),

  productCategoryIds: field({ type: [String] }),
  productIds: field({ type: [String] }),
  discountPercent: field({ type: Number }),

  bonusProductId: field({ type: String }),
  bonusCount: field({ type: Number, optional: true }),

  coupon: field({ type: String }),

  spinCampaignId: field({ type: String }),
  spinCount: field({ type: Number }),

  lotteryCampaignId: field({ type: String }),
  lotteryCount: field({ type: Number })
});
