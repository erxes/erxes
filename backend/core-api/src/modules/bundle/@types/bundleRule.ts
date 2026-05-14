import { IProduct } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IBundleRuleItem {
  productIds?: string[];
  products?: IProduct[];
  allowSkip?: boolean;
  quantity: number;
  priceType: string;
  priceAdjustType: string;
  priceAdjustFactor: string;
  priceValue: number;
  percent: number;
}
export interface IBundleRule {
  code?: string;
  name?: string;
  description?: string;
  rules: IBundleRuleItem[];
}

export interface IBundleRuleDocument extends IBundleRule, Document {
  _id: string;
  createdAt: Date;
}
