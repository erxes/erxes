import { Schema, Document } from 'mongoose';

import { field, schemaWrapper } from './utils';
import { ACCOUNT_CATEGORY_MASK_TYPES, ACCOUNT_CATEGORY_STATUSES } from './constants';

export interface IAccountCategory {
  name: string;
  code: string;
  order: string;
  scopeBrandIds?: string[];
  description?: string;
  parentId?: string;
  status?: string;
  mergeIds?: string[];
  maskType?: string;
  mask?: any;
}

export interface IAccountCategoryDocument extends IAccountCategory, Document {
  _id: string;
  createdAt: Date;
}

export const accountCategorySchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    code: field({ type: String, unique: true, label: 'Code' }),
    order: field({ type: String, label: 'Order' }),
    parentId: field({ type: String, optional: true, label: 'Parent' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    status: field({
      type: String,
      enum: ACCOUNT_CATEGORY_STATUSES.ALL,
      optional: true,
      label: 'Status',
      default: 'active',
      esType: 'keyword',
      index: true,
    }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at',
    }),
    maskType: field({
      type: String,
      optional: true,
      label: 'Mask type',
      enum: ACCOUNT_CATEGORY_MASK_TYPES.ALL,
    }),
    mask: field({ type: Object, label: 'Mask', optional: true }),
  }),
);
