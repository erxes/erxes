import {
  attachmentSchema,
  customFieldSchema,
  ICustomField
} from '@erxes/api-utils/src/types';
import { Schema, Document } from 'mongoose';

import { field, schemaWrapper } from './utils';

export const ACCOUNT_TYPES = {
  ACCOUNT: 'active',
  SERVICE: 'passive',
  ALL: ['active', 'passive']
};

export const ACCOUNT_STATUSES = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted']
};

export const JOURNAL_TYPES = {
  MAIN: 'main',
  CASH: 'cash',
  ALL: ['main', 'cash']
};
export const ACCOUNT_CATEGORY_STATUSES = {
  ACTIVE: 'active',
  DELETED: 'deleted',

  ALL: ['active', 'deleted']
};

export interface IAccount {
  name: string;
  categoryId?: string;
  categoryCode?: string;
  type?: string;
  code: string;
  accountId?: string;
  status?: string;
  currency?: number;
  isBalance?: boolean;
  closePercent?: number;
  journal?: string;
  customFieldsData?: ICustomField[];
}

export interface IAccountDocument extends IAccount, Document {
  _id: string;
  createdAt: Date;
}

export interface IAccountCategory {
  name: string;
  code: string;
  order: string;
  parentId?: string;
  status?: string;
}

export interface IAccountCategoryDocument extends IAccountCategory, Document {
  _id: string;
  createdAt: Date;
}

export const accountSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    code: field({ type: String, unique: true, label: 'Code' }),
    categoryId: field({ type: String, label: 'Category' }),
    type: field({
      type: String,
      enum: ACCOUNT_TYPES.ALL,
      default: ACCOUNT_TYPES.ACCOUNT,
      label: 'Type'
    }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    }),
    customFieldsData: field({
      type: [customFieldSchema],
      optional: true,
      label: 'Custom fields'
    }),
    status: field({
      type: String,
      enum: ACCOUNT_STATUSES.ALL,
      optional: true,
      label: 'Status',
      default: 'active',
      esType: 'keyword',
      index: true
    }),
    currency: field({ type: Number, label: 'Currency' }),
    isBalance: field({ type: Boolean, label: 'Is balance' }),
    closePercent: field({ type: Number, label: 'Close percent' }),
    journal: field({
      type: String,
      enum: JOURNAL_TYPES.ALL,
      optional: true,
      label: 'main',
      default: 'main',
      esType: 'keyword',
      index: true
    })
  })
);

export const accountCategorySchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    code: field({ type: String, unique: true, label: 'Code' }),
    order: field({ type: String, label: 'Order' }),
    parentId: field({ type: String, optional: true, label: 'Parent' }),
    status: field({
      type: String,
      enum: ACCOUNT_CATEGORY_STATUSES.ALL,
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
