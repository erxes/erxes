import {
  attachmentSchema,
  customFieldSchema,
  ICustomField
} from '@erxes/api-utils/src/types';
import { Schema, Document } from 'mongoose';

import { field, schemaWrapper } from './utils';

export const PRODUCT_TYPES = {
  PRODUCT: 'product',
  SERVICE: 'service',
  ALL: ['product', 'service']
};

export const PRODUCT_STATUSES = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted']
};

export const PRODUCT_CATEGORY_STATUSES = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  ARCHIVED: 'archived',
  ALL: ['active', 'disabled', 'archived']
};

export const PRODUCT_SUPPLY = {
  UNIQUE: 'unique',
  LIMITED: 'limited',
  UNLIMITED: 'unlimited',
  ALL: ['unique', 'limited', 'unlimited']
};

export interface ISubUom {
  uomId: string;
  ratio: number;
}
export interface IProduct {
  name: string;
  categoryId?: string;
  categoryCode?: string;
  type?: string;
  description?: string;
  sku?: string;
  unitPrice?: number;
  code: string;
  customFieldsData?: ICustomField[];
  productId?: string;
  tagIds?: string[];
  attachment?: any;
  attachmentMore?: any[];
  status?: string;
  supply?: string;
  productCount?: number;
  minimiumCount?: number;
  vendorId?: string;
  vendorCode?: string;

  mergedIds?: string[];

  uomId?: string;
  subUoms?: ISubUom[];
}

export interface IProductDocument extends IProduct, Document {
  _id: string;
  createdAt: Date;
}

export interface IProductCategory {
  name: string;
  code: string;
  order: string;
  description?: string;
  parentId?: string;
  attachment?: any;
  status?: string;
}

export interface IProductCategoryDocument extends IProductCategory, Document {
  _id: string;
  createdAt: Date;
}

const subUomSchema = new Schema({
  _id: field({ pkey: true }),
  uomId: field({ type: String, label: 'Sub unit of measurement' }),
  ratio: field({ type: Number, label: 'ratio of sub uom to main uom' })
});

export const productSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    code: field({ type: String, unique: true, label: 'Code' }),
    categoryId: field({ type: String, label: 'Category' }),
    type: field({
      type: String,
      enum: PRODUCT_TYPES.ALL,
      default: PRODUCT_TYPES.PRODUCT,
      label: 'Type'
    }),
    tagIds: field({
      type: [String],
      optional: true,
      label: 'Tags',
      index: true
    }),
    description: field({ type: String, optional: true, label: 'Description' }),
    sku: field({ type: String, optional: true, label: 'Stock keeping unit' }),
    unitPrice: field({ type: Number, optional: true, label: 'Unit price' }),
    customFieldsData: field({
      type: [customFieldSchema],
      optional: true,
      label: 'Custom fields data'
    }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    }),
    attachment: field({ type: attachmentSchema }),
    attachmentMore: field({ type: [attachmentSchema] }),
    status: field({
      type: String,
      enum: PRODUCT_STATUSES.ALL,
      optional: true,
      label: 'Status',
      default: 'active',
      esType: 'keyword',
      index: true
    }),
    supply: field({
      type: String,
      enum: PRODUCT_SUPPLY.ALL,
      optional: true,
      label: 'Supply',
      default: 'unlimited',
      esType: 'keyword',
      index: true
    }),
    productCount: field({
      type: String,
      label: 'Product Count',
      default: '0'
    }),
    minimiumCount: field({
      type: String,
      label: 'Minimium Count',
      default: '0'
    }),
    vendorId: field({ type: String, optional: true, label: 'Vendor' }),
    mergedIds: field({ type: [String], optional: true }),

    uomId: field({
      type: String,
      optional: true,
      label: 'Main unit of measurement'
    }),
    subUoms: field({
      type: [subUomSchema],
      optional: true,
      label: 'Sum unit of measurements'
    })
  })
);

export const productCategorySchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    code: field({ type: String, unique: true, label: 'Code' }),
    order: field({ type: String, label: 'Order' }),
    parentId: field({ type: String, optional: true, label: 'Parent' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    attachment: field({ type: attachmentSchema }),
    status: field({
      type: String,
      enum: PRODUCT_CATEGORY_STATUSES.ALL,
      optional: true,
      label: 'Status',
      default: 'active',
      esType: 'keyword',
      index: true
    }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    })
  })
);
