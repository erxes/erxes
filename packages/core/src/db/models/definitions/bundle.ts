import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';
import { IProduct } from './products';

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

export interface IBundleCondition {
  code?: string;
  name?: string;
  description?: string;
  userId?: string;
  isDefault?: boolean;
}

export interface IBundleConditionDocument extends IBundleCondition, Document {
  _id: string;
  createdAt: Date;
}

export interface IBundleRuleDocument extends IBundleRule, Document {
  _id: string;
  createdAt: Date;
}

const ruleItemSchema = new Schema({
  code: { type: String, required: true }, // Single key
  productIds: field({ type: [String] }),
  allowSkip: field({ type: Boolean, required: true }),
  quantity: field({ type: Number, label: 'quantity' }),
  priceType: field({
    type: String,
    enum: ['thisProductPricePercent', 'mainPricePercent', 'price'],
  }),
  priceAdjustType: field({ type: String }),
  priceAdjustFactor: field({ type: String }),
  priceValue: field({ type: Number }),
  percent: field({ type: Number }),
});

// Mongoose schemas ===========
export const bundleRuleSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String, label: 'Code' }),
  name: field({ type: String, label: 'Name' }),
  description: field({
    type: String,
    optional: true,
    label: 'Description',
  }),
  rules: field({ type: [ruleItemSchema], label: 'rules' }),
});

export const bundleConditionsSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    code: field({ type: String, label: 'Code' }),
    name: field({ type: String, label: 'Name' }),
    userId: field({ type: String, label: 'userId' }),
    isDefault: field({ type: Boolean, label: 'is default' }),
    description: field({
      type: String,
      optional: true,
      label: 'Description',
    }),
  })
);
