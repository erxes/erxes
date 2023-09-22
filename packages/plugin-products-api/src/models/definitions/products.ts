import {
  attachmentSchema,
  customFieldSchema,
  IAttachment,
  ICustomField
} from '@erxes/api-utils/src/types';
import { Schema, Document } from 'mongoose';

import { field, schemaWrapper } from './utils';

export const PRODUCT_TYPES = {
  PRODUCT: 'product',
  SERVICE: 'service',
  UNIQUE: 'unique',
  ALL: ['product', 'service', 'unique']
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

export const PRODUCT_CATEGORY_MASK_TYPES = {
  ANY: '',
  SOFT: 'soft',
  HARD: 'hard',
  ALL: ['', 'soft', 'hard']
};

export interface ISubUom {
  uom: string;
  ratio: number;
}

export interface IProduct {
  name: string;
  categoryId?: string;
  categoryCode?: string;
  type?: string;
  description?: string;
  barcodes?: string[];
  variants: { [code: string]: { image?: IAttachment; name?: string } };
  barcodeDescription?: string;
  unitPrice?: number;
  code: string;
  customFieldsData?: ICustomField[];
  productId?: string;
  tagIds?: string[];
  attachment?: IAttachment;
  attachmentMore?: IAttachment[];
  status?: string;
  vendorId?: string;
  vendorCode?: string;

  mergedIds?: string[];

  uom?: string;
  subUoms?: ISubUom[];
  taxType?: string;
  taxCode?: string;
  sameMasks?: string[];
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
    barcodes: field({
      type: [String],
      optional: true,
      label: 'Barcodes',
      index: true
    }),
    variants: field({ type: Object, optional: true }),
    barcodeDescription: field({
      type: String,
      optional: true,
      label: 'Barcode Description'
    }),
    description: field({ type: String, optional: true, label: 'Description' }),
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
    vendorId: field({ type: String, optional: true, label: 'Vendor' }),
    mergedIds: field({ type: [String], optional: true }),

    uom: field({
      type: String,
      optional: true,
      label: 'Main unit of measurement'
    }),
    subUoms: field({
      type: [subUomSchema],
      optional: true,
      label: 'Sub unit of measurements'
    }),
    taxType: field({ type: String, optional: true, label: 'TAX type' }),
    taxCode: field({ type: String, optional: true, label: 'tax type code' }),
    sameMasks: field({ type: [String] })
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
      index: true
    }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    }),
    maskType: field({
      type: String,
      optional: true,
      label: 'Mask type',
      enum: PRODUCT_CATEGORY_MASK_TYPES.ALL
    }),
    mask: field({ type: Object, label: 'Mask', optional: true }),
    isSimilarity: field({
      type: Boolean,
      label: 'is Similiraties',
      optional: true
    }),
    similarities: field({
      type: [{ id: String, groupId: String, fieldId: String, title: String }],
      optional: true
    })
  })
);
