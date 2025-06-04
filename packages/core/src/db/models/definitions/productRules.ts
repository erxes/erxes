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
  name: field({ type: String })
});
