import { Schema, Document } from 'mongoose';

import { field, schemaWrapper } from './utils';

export const ACCOUNT_KINDS = {
  ACTIVE: 'active',
  PASSIVE: 'passive',
  ALL: ['active', 'passive'],
};

export const ACCOUNT_JOURNALS = {
  MAIN: 'main',
  FUND_CASH: 'cash',
  FUND_BANK: 'bank',
  DEBT: 'debt',
  INVENTORY: 'inventory',
  FIXED_ASSET: 'fixedAsset',
  VAT: 'vat',
  ALL: ['main', 'cash', 'bank', 'debt', 'inventory', 'fixedAsset', 'vat'],
};

export const ACCOUNT_STATUSES = {
  ACTIVE: 'active',
  DELETED: 'deleted',
  ALL: ['active', 'deleted'],
};

export interface IAccount {
  code: string;
  name: string;
  categoryId?: string;
  parentId?: string;
  currency: string;
  kind: string;
  journal: string;
  description?: string;
  branchId?: string;
  departmentId?: string;
  scopeBrandIds?: string[];
  status?: string;
  mergedIds?: string[];
}

export interface IAccountDocument extends IAccount, Document {
  _id: string;
  createdAt: Date;
}

export const accountSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    code: field({ type: String, unique: true, label: 'Code' }),
    name: field({ type: String, label: 'Name' }),
    categoryId: field({ type: String, label: 'Category' }),
    parentId: field({ type: String, label: 'Parent account' }),
    currency: field({ type: String, label: 'Currency' }),
    kind: field({
      type: String,
      enum: ACCOUNT_KINDS.ALL,
      default: ACCOUNT_KINDS.ACTIVE,
      label: 'KIND',
    }),
    journal: field({
      type: String,
      enum: ACCOUNT_KINDS.ALL,
      default: ACCOUNT_KINDS.ACTIVE,
      label: 'KIND',
    }),
    description: field({ type: String, optional: true, label: 'Description' }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at',
    }),
    status: field({
      type: String,
      enum: ACCOUNT_STATUSES.ALL,
      optional: true,
      label: 'Status',
      default: 'active',
      esType: 'keyword',
      index: true,
    }),
    mergedIds: field({ type: [String], optional: true }),
  }),
);
