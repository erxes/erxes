import { Document } from 'mongoose';

export interface IProductRule {
  _id?: string;
  id?: string;
  title: string;

  // Filters
  productIds?: string[];
  productCategoryIds?: string[];
  excludeCategoryIds?: string[];
  excludeProductIds?: string[];
  tagIds?: string[];
  excludeTagIds?: string[];

  // Rules
  kind: string; // vat, ctax
  taxType?: string;
  taxCode?: string;
  taxPercent?: number;

  createdAt?: Date;
  modifiedAt?: Date;
}

export interface IProductRuleUpdate extends IProductRule {
  _id: string;
}

export interface IProductRuleDocument extends Omit<IProductRule, 'id'>, Document {
  _id: string;
  id: string;
  createdAt: Date;
  modifiedAt: Date;
}