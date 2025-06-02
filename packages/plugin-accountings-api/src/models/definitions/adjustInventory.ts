import { Schema, Document } from 'mongoose';

import { field, schemaWrapper } from './utils';
import { ICommonAdjusting } from './commonAdjusting';

export interface IAdjustInvDetailParams {
  productId: string,
  accountId: string,
  departmentId: string,
  branchId: string,
}

export interface IAdjustInvDetailParamsId extends IAdjustInvDetailParams {
  adjustId: string
}

export interface IAdjustInvDetail extends IAdjustInvDetailParamsId {
  remainder: number;
  cost: number;
  unitCost: number;
  soonInCount?: number;
  soonOutCount?: number;

  error?: string;
  warning?: string;
  byDate?: any;
}

export interface IAdjustInvDetailDocument extends IAdjustInvDetail, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdjustInventory extends ICommonAdjusting {
  date: Date;
  description: string;
  status: string;
  error?: string;
  warning?: string;
  beginDate?: Date;
  successDate?: Date;
  checkedDate?: Date;

  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  modifiedBy?: string;
}

export interface IAdjustInventoryDocument extends IAdjustInventory, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  modifiedBy: string;
}

export const ADJ_INV_STATUSES = {
  DRAFT: 'draft',
  CANCEL: 'cancel',
  PUBLISH: 'publish',
  all: ['draft', 'cancel', 'publish']
}

export const adjustInvDetailsSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    adjustId: field({ type: String, optional: true, label: 'Adjust inventory' }),
    productId: field({ type: String, optional: true, label: 'Product' }),
    accountId: field({ type: String, label: 'account' }),
    branchId: field({ type: String, label: 'branch' }),
    departmentId: field({ type: String, label: 'department' }),
    remainder: field({ type: Number, optional: true, label: 'remainder' }),
    cost: field({ type: Number, optional: true, label: 'cost' }),
    unitCost: field({ type: Number, optional: true, label: 'unitCost' }),
    soonInCount: field({ type: Number, optional: true, label: 'soonInCount' }),
    soonOutCount: field({ type: Number, optional: true, label: 'soonOutCount' }),
    error: field({ type: String, optional: true, label: 'error' }),
    warning: field({ type: String, optional: true, label: 'warning' }),
    createdAt: field({ type: Date, default: new Date(), label: 'Created at' }),
    updatedAt: field({ type: Date, optional: true, label: 'Modified at' }),
  })
);

export const adjustInventoriesSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    date: field({ type: Date, label: 'date' }),
    description: field({ type: String, label: 'description' }),
    status: field({ type: String, default: 'draft', enum: ADJ_INV_STATUSES.all, label: 'status' }),
    error: field({ type: String, optional: true, label: 'error' }),
    warning: field({ type: String, optional: true, label: 'warning' }),
    beginDate: field({ type: Date, label: 'date' }),
    checkedDate: field({ type: Date, label: 'date' }),
    successDate: field({ type: Date, label: 'current date' }),
    createdBy: field({ type: String, label: 'Created user' }),
    modifiedBy: field({ type: String, optional: true, label: 'Modified user' }),
    createdAt: field({ type: Date, default: new Date(), label: 'Created at' }),
    updatedAt: field({ type: Date, optional: true, label: 'Modified at' }),
  }),
);
