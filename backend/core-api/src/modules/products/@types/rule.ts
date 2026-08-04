import { Document } from 'mongoose';

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
