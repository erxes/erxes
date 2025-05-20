import { Document, Schema } from "mongoose";
import {
  commonCampaignSchema,
  ICommonCampaignDocument,
  ICommonCampaignFields,
} from "./common";
import { field } from "./utils";

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

  kind: 'amount' | 'percent';
  value: number;
  restrictions: any;
}

export interface IVoucherCampaignDocument
  extends IVoucherCampaign,
    ICommonCampaignDocument,
    Document {
  _id: string;
}

export const voucherCampaignSchema = new Schema({
  ...commonCampaignSchema,

  buyScore: field({ type: Number, label: "Buy score" }),

  score: field({ type: Number, label: "Score" }),
  scoreAction: field({ type: String, label: "Score action" }),

  voucherType: field({ type: String, label: "Voucher type" }),

  productCategoryIds: field({ type: [String], label: "Product category ids" }),
  productIds: field({ type: [String], label: "Product ids" }),
  discountPercent: field({ type: Number, label: "Discount percent" }),

  bonusProductId: field({ type: String, label: "Bonus product id" }),
  bonusCount: field({ type: Number, optional: true, label: "Bonus count" }),

  coupon: field({ type: String, label: "Coupon" }),

  spinCampaignId: field({ type: String, label: "Spin campaign id" }),
  spinCount: field({ type: Number, label: "Spin count" }),

  lotteryCampaignId: field({ type: String, label: "Lottery campaign id" }),
  lotteryCount: field({ type: Number, label: "Lottery count" }),

  kind: field({
    type: String,
    enum: ["amount", "percent"],
    required: true,
  }),
  value: field({
    type: Number,
    required: true,
    min: 0,
  }),

  restrictions: field({
    type: Schema.Types.Mixed,
  }),
});
