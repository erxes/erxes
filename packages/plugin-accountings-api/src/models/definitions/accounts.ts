import {
  attachmentSchema,
  customFieldSchema,
  IAttachment,
  ICustomField,
} from '@erxes/api-utils/src/types';
import { Schema, Document } from 'mongoose';

import { field, schemaWrapper } from './utils';

export const ACCOUNT_TYPES = {
  ACCOUNT: 'accounting',
  SERVICE: 'service',
  UNIQUE: 'unique',
  ALL: ['accounting', 'service', 'unique'],
};

export const ACCOUNT_STATUSES = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted'],
};

export const ACCOUNT_CATEGORY_STATUSES = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  ARCHIVED: 'archived',
  ALL: ['active', 'disabled', 'archived'],
};

export const ACCOUNT_CATEGORY_MASK_TYPES = {
  ANY: '',
  SOFT: 'soft',
  HARD: 'hard',
  ALL: ['', 'soft', 'hard'],
};

export interface ISubUom {
  uom: string;
  ratio: number;
}

export interface IAccount {
  name: string;
  shortName?: string;
  categoryId?: string;
  categoryCode?: string;
  type?: string;
  scopeBrandIds?: string[];
  description?: string;
  barcodes?: string[];
  variants: { [code: string]: { image?: IAttachment; name?: string } };
  barcodeDescription?: string;
  unitPrice?: number;
  code: string;
  customFieldsData?: ICustomField[];
  accountingId?: string;
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

export interface IAccountDocument extends IAccount, Document {
  _id: string;
  createdAt: Date;
}

export interface IAccountCategory {
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

export interface IAccountCategoryDocument extends IAccountCategory, Document {
  _id: string;
  createdAt: Date;
}

export const accountSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    shortName: field({ type: String, optional: true, label: 'Short name' }),
    code: field({ type: String, unique: true, label: 'Code' }),
    categoryId: field({ type: String, label: 'Category' }),
    type: field({
      type: String,
      enum: ACCOUNT_TYPES.ALL,
      default: ACCOUNT_TYPES.ACCOUNT,
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
      enum: ACCOUNT_STATUSES.ALL,
      optional: true,
      label: 'Status',
      default: 'active',
      esType: 'keyword',
      index: true,
    }),
    vendorId: field({ type: String, optional: true, label: 'Vendor' }),
    mergedIds: field({ type: [String], optional: true }),
    taxType: field({ type: String, optional: true, label: 'TAX type' }),
    taxCode: field({ type: String, optional: true, label: 'tax type code' }),
    sameMasks: field({ type: [String] }),
  }),
);

export const accountCategorySchema = schemaWrapper(
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
    isSimilarity: field({
      type: Boolean,
      label: 'is Similiraties',
      optional: true,
    }),
    similarities: field({
      type: [{ id: String, groupId: String, fieldId: String, title: String }],
      optional: true,
    }),
  }),
);
