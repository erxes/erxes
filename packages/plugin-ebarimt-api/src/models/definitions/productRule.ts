import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

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

export const productRuleSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({ type: Date, label: 'Created at', index: true }),
    modifiedAt: field({ type: Date, label: 'Modified at' }),

    title: field({ type: String, label: 'title' }),

    // filters
    productIds: field({ type: [String], optional: true, label: 'product' }),
    productCategoryIds: field({ type: [String], optional: true, label: 'productCategory' }),
    excludeCategoryIds: field({ type: [String], optional: true, label: 'excludeCategory' }),
    excludeProductIds: field({ type: [String], optional: true, label: 'excludeProduct' }),
    tagIds: field({ type: [String], optional: true, label: 'tag' }),
    excludeTagIds: field({ type: [String], optional: true, label: 'excludeTag' }),

    // rules
    kind: field({ type: String, label: 'kind' }), // vat, ctax
    taxType: field({ type: String, label: 'taxType', optional: true }),
    taxCode: field({ type: String, label: 'taxCode', optional: true }),
    taxPercent: field({ type: Number, label: 'Percent', optional: true }),
  }),

  'erxes_ebarimt'
);
