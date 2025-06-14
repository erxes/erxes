import {
  attachmentSchema,
  customFieldSchema,
  IAttachment,
  ICustomField,
  IPdfAttachment,
} from '@erxes/api-utils/src/types';
import { Schema, Document } from 'mongoose';

import { field, schemaWrapper } from './utils';

export interface IProductsConfig {
  code: string;
  value: any;
}

export interface IProductsConfigDocument extends IProductsConfig, Document {
  _id: string;
}

export const PRODUCT_TYPES = {
  PRODUCT: 'product',
  SERVICE: 'service',
  UNIQUE: 'unique',
  SUBSCRIPTION: 'subscription',
  ALL: ['product', 'service', 'unique', 'subscription'],
};

export const PRODUCT_STATUSES = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted'],
};

export const PRODUCT_CATEGORY_STATUSES = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  ARCHIVED: 'archived',
  ALL: ['active', 'disabled', 'archived'],
};

export const PRODUCT_CATEGORY_MASK_TYPES = {
  ANY: '',
  SOFT: 'soft',
  HARD: 'hard',
  ALL: ['', 'soft', 'hard'],
};

export const TIMELY_TYPES = {
  ANY: '',
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
  seasonally: 'seasonally',
  ALL: ['', 'daily', 'weekly', 'monthly', 'seasonally'],
};

export interface ISubUom {
  uom: string;
  ratio: number;
}

export interface IUom {
  code: string;
  name: string;
  timely?: string;
}

export interface IUomDocument extends IUom, Document {
  _id: string;
  createdAt: Date;
}

const subscriptionConfigSchema = new Schema({
  period: field({ type: String, label: 'Subscription Period`' }),
  rule: field({ type: String, label: 'Subscription Rule' }),
  specificDay: field({
    type: String,
    label: 'Subscription Start Day',
    optional: true,
  }),

  subsRenewable: field({
    type: Boolean,
    label: 'Subscription Renewable',
    optional: true,
  }),
});

export interface IProduct {
  name: string;
  shortName?: string;
  categoryId?: string;
  categoryCode?: string;
  bundleId?: string;
  type?: string;
  scopeBrandIds?: string[];
  description?: string;
  barcodes?: string[];
  variants: { [code: string]: { image?: IAttachment; name?: string } };
  barcodeDescription?: string;
  unitPrice?: number;
  code: string;
  customFieldsData?: ICustomField[];
  tagIds?: string[];
  attachment?: IAttachment;
  attachmentMore?: IAttachment[];
  status?: string;
  vendorId?: string;
  vendorCode?: string;

  mergedIds?: string[];

  uom?: string;
  subUoms?: ISubUom[];
  sameMasks?: string[];
  sameDefault?: string[];
  currency?: string;

  pdfAttachment?: IPdfAttachment;
}

export interface IProductDocument extends IProduct, Document {
  _id: string;
  createdAt: Date;
}

export interface IProductCategory {
  name: string;
  code: string;
  order: string;
  scopeBrandIds?: string[];
  description?: string;
  meta?: string;
  parentId?: string;
  attachment?: any;
  status?: string;
  maskType?: string;
  mask?: any;
  isSimilarity?: boolean;
  similarities?: {
    id: string;
    groupId: string;
    fieldId: string;
    title: string;
  }[];
}

export interface IProductCategoryDocument extends IProductCategory, Document {
  _id: string;
  createdAt: Date;
}

const subUomSchema = new Schema({
  _id: field({ pkey: true }),
  uom: field({ type: String, label: 'Sub unit of measurement' }),
  ratio: field({ type: Number, label: 'ratio of sub uom to main uom' }),
});

export const productSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    shortName: field({ type: String, optional: true, label: 'Short name' }),
    code: field({ type: String, unique: true, label: 'Code' }),
    categoryId: field({ type: String, label: 'Category' }),
    bundleId: field({ type: String, label: 'bundleId' }),
    type: field({
      type: String,
      enum: PRODUCT_TYPES.ALL,
      default: PRODUCT_TYPES.PRODUCT,
      label: 'Type',
    }),
    tagIds: field({
      type: [String],
      optional: true,
      label: 'Tags',
      index: true,
    }),
    barcodes: field({
      type: [String],
      optional: true,
      label: 'Barcodes',
      index: true,
    }),
    variants: field({ type: Object, optional: true }),
    barcodeDescription: field({
      type: String,
      optional: true,
      label: 'Barcode Description',
    }),
    description: field({ type: String, optional: true, label: 'Description' }),
    unitPrice: field({ type: Number, optional: true, label: 'Unit price' }),
    customFieldsData: field({
      type: [customFieldSchema],
      optional: true,
      label: 'Custom fields data',
    }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at',
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
      index: true,
    }),
    vendorId: field({ type: String, optional: true, label: 'Vendor' }),
    mergedIds: field({ type: [String], optional: true }),

    uom: field({
      type: String,
      optional: true,
      label: 'Main unit of measurement',
    }),
    subUoms: field({
      type: [subUomSchema],
      optional: true,
      label: 'Sub unit of measurements',
    }),
    sameMasks: field({ type: [String] }),
    sameDefault: field({ type: [String] }),
    currency: field({
      type: String,
      optional: true,
      label: 'Currency',
    }),

    pdfAttachment: field({
      type: Object,
      optional: true,
      label: 'PDF attachment',
    }),
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
    meta: field({ type: String, optional: true, label: 'Meta' }),
    attachment: field({ type: attachmentSchema }),
    status: field({
      type: String,
      enum: PRODUCT_CATEGORY_STATUSES.ALL,
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
      enum: PRODUCT_CATEGORY_MASK_TYPES.ALL,
    }),
    mask: field({ type: Object, label: 'Mask', optional: true }),
    isSimilarity: field({
      type: Boolean,
      label: 'is Similiraties',
      optional: true,
    }),
    similarities: field({
      type: [{ id: String, groupId: String, fieldId: String, title: String }],
      optional: true,
    }),
  })
);

export const uomSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    code: field({ type: String, unique: true, label: 'Code' }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at',
    }),
    isForSubscription: field({
      type: Boolean,
      optional: true,
      label: 'Uom for subscription',
    }),
    subscriptionConfig: field({
      type: subscriptionConfigSchema,
      optional: true,
      label: 'Subscription configuration',
    }),
    timely: field({
      type: String,
      optional: true,
      label: 'Timely',
      enum: TIMELY_TYPES.ALL,
    }),
  })
);

export const productsConfigSchema = new Schema({
  _id: field({ pkey: true }),
  code: field({ type: String, unique: true }),
  value: field({ type: Object }),
});
