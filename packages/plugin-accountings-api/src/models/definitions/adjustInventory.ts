import { Schema, Document } from 'mongoose';

import { field, schemaWrapper } from './utils';
import { ICommonAdjusting } from './commonAdjusting';

export interface IAdjInvDetail {
  _id: string;
  productId: string;
  remainder: number;
  cost: number;
  unitCost: number;
  soonInCount: number;
  soonOutCount: number;
}

export interface IAdjustInventory extends ICommonAdjusting {
  date: Date;
  accountId: string;
  branchId: string;
  departmentId: string;
  description: string;
  status: string;
  productIds?: string[];
  details?: IAdjInvDetail[];
}

export interface IAdjustInventoryDocument extends IAdjustInventory, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}

export const ADJ_INV_STATUSES = {
  DRAFT: 'draft',
  CANCEL: 'cancel',
  PUBLISH: 'publish',
  all: ['draft', 'cancel', 'publish']
}
export const adjInvDetailSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    productId: field({ type: String, optional: true, label: 'Product' }),
    remainder: field({ type: Number, optional: true, label: 'remainder' }),
    cost: field({ type: Number, optional: true, label: 'cost' }),
    unitCost: field({ type: Number, optional: true, label: 'unitCost' }),
    soonInCount: field({ type: Number, optional: true, label: 'soonInCount' }),
    soonOutCount: field({ type: Number, optional: true, label: 'soonOutCount' }),
  })
);

export const adjustInventoriesSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    date: field({ type: Date, label: 'date' }),
    accountId: field({ type: String, label: 'account' }),
    branchId: field({ type: String, label: 'branch' }),
    departmentId: field({ type: String, label: 'department' }),
    description: field({ type: String, label: 'description' }),
    status: field({ type: String, default: 'draft', enum: ADJ_INV_STATUSES.all, label: 'status' }),
    productIds: field({ type: [String], label: 'products' }),
    details: field({ type: [adjInvDetailSchema], label: 'products' }),
    createdBy: field({ type: String, label: 'Created user' }),
    modifiedBy: field({ type: String, optional: true, label: 'Modified user' }),
    createdAt: field({ type: Date, default: new Date(), label: 'Created at' }),
    modifiedAt: field({ type: Date, optional: true, label: 'Modified at' }),
  }),
);
