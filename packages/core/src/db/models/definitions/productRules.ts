import { Document, Schema } from 'mongoose';

import { field } from './utils';

export interface IProductRule {
  categoryIds?: string[];
  excludeCategoryIds?: string[];
  productIds?: string[];
  excludeProductIds?: string[];
  tagIds?: string[];
  excludeTagIds?: string[];
  unitPrice: number;
  bundleId?: string;
  name: string;
  returnAmount?: number;
  returnPercent?: number;
  prepaidPercent?: number;
  discountPercent?: number;
}

export interface IProductRuleDocument extends IProductRule, Document {
  _id: string;
}

export const productRuleSchema = new Schema({
  categoryIds: field({ type: [String], label: 'When using specific product categories' }),
  excludeCategoryIds: field({ type: [String], label: 'When excluding specific categories' }),
  productIds: field({ type: [String], label: 'When including specific products' }),
  excludeProductIds: field({ type: [String], label: 'When excluding specific products' }),
  tagIds: field({ type: [String], label: 'When including specific products with tags' }),
  excludeTagIds: field({ type: [String], label: 'When excluding specific products with tags' }),
  unitPrice: field({ type: Number, label: 'Unit price' }),
  bundleId: field({ type: String, label: 'Relevant loyalty bundle id' }),
  name: field({ type: String, label: 'Name' }),
  // if hasReturn === true
  returnAmount: field({ type: Number, min: 0, label: 'Return amount' }),
  // returnAmount will override returnPercent
  returnPercent: field({ type: Number, min: 0, max: 100, label: 'Return percent' }),
  // if hasReturn === false
  prepaidPercent: field({ type: Number, min: 0, max: 100, label: 'Prepaid percent' }),
  discountPercent: field({ type: Number, min: 0, max: 100, label: 'Discount percent' }),
});
