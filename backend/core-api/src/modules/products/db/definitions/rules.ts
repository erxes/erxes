import { Schema } from 'mongoose';

export const productRuleSchema = new Schema({
  categoryIds: {
    type: [String],
    label: 'When using specific product categories',
  },
  excludeCategoryIds: {
    type: [String],
    label: 'When excluding specific categories',
  },
  productIds: {
    type: [String],
    label: 'When including specific products',
  },
  excludeProductIds: {
    type: [String],
    label: 'When excluding specific products',
  },
  tagIds: {
    type: [String],
    label: 'When including specific products with tags',
  },
  excludeTagIds: {
    type: [String],
    label: 'When excluding specific products with tags',
  },
  unitPrice: { type: Number, label: 'Unit price' },
  bundleId: { type: String, label: 'Relevant loyalty bundle id' },
  name: { type: String },
});
