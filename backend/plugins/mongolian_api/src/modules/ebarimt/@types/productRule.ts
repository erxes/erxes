import { Document } from 'mongoose';

export interface IProductRule {
  title: string;

  // filters
  productIds?: string[];
  productCategoryIds?: string[];
  excludeCategoryIds?: string[];
  excludeProductIds?: string[];
  tagIds?: string[];
  excludeTagIds?: string[];

  // rules
  kind: string; // vat, ctax

  // vat
  taxType?: string;
  taxCode?: string;
  taxPercent?: number;
}

export interface IProductRuleDocument extends Document, IProductRule {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}
