import { Schema, Document } from 'mongoose';

import { field, schemaWrapper } from './utils';
import { ACCOUNT_JOURNALS, ACCOUNT_KINDS, ACCOUNT_STATUSES } from './constants';

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
  status: string;
  isOutBalance: boolean;
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
    parentId: field({ type: String, optional: true, label: 'Parent account' }),
    currency: field({ type: String, label: 'Currency' }),
    kind: field({
      type: String,
      enum: ACCOUNT_KINDS.ALL,
      default: ACCOUNT_KINDS.ACTIVE,
      label: 'KIND',
    }),
    journal: field({
      type: String,
      enum: ACCOUNT_JOURNALS.ALL,
      default: ACCOUNT_JOURNALS.MAIN,
      label: 'KIND',
    }),
    description: field({ type: String, optional: true, label: 'Description' }),
    branchId: field({ type: String, optional: true, label: 'Branch' }),
    departmentId: field({ type: String, optional: true, label: 'Department' }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at',
    }),
    status: field({
      type: String,
      enum: ACCOUNT_STATUSES.ALL,
      label: 'Status',
      default: 'active',
      esType: 'keyword',
      index: true,
    }),
    isOutBalance: field({ type: Boolean, default: false }),
    mergedIds: field({ type: [String], optional: true }),
  }),
);
