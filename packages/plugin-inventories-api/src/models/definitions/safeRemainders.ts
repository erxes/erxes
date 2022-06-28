import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface ISafeRemainder {
  date: Date;
  description?: string;

  status: string;
  branchId: string;
  departmentId: string;
  productCategoryId: string;
  createdAt?: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
}

export interface ISafeRemainderDocument extends ISafeRemainder, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}

export interface ISafeRemItem {
  remainderId: string;
  productId: string;
  branchId: string;
  departmentId: string;

  preCount: number;
  count: number;
  uomId: string;

  status: string;
}

export interface ISafeRemItemDocument extends ISafeRemItem, Document {
  _id: string;
  modifiedAt: Date;
  lastTrDate: Date;
}

export const safeRemItemSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    remainderId: field({ type: String }),
    productId: field({ type: String, index: true }),
    branchId: field({ type: String, default: '', label: 'Branch' }),
    departmentId: field({ type: String, default: '', label: 'Department' }),

    preCount: field({ type: Number, label: 'Pre count' }),
    count: field({ type: Number, label: 'Remainder count' }),

    status: field({ type: String, label: 'Status' }),

    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified date'
    }),
    lastTrDate: field({ type: Date, label: 'Last TR' })
  }),
  'erxes_rem_items'
);

export const safeRemainderSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    date: field({ type: Date, label: 'Date' }),
    description: field({ type: String, label: 'Description' }),

    status: field({ type: String, label: 'Status' }),
    branchId: field({ type: String, default: '', label: 'Branch' }),
    departmentId: field({ type: String, default: '', label: 'Department' }),
    productCategoryId: field({ type: String, label: 'Product Category' }),

    createdAt: { type: Date, default: new Date(), label: 'Created date' },
    createdBy: { type: String, label: 'Created User' },
    modifiedAt: { type: Date, default: new Date(), label: 'Modified date' },
    modifiedBy: { type: String, label: 'Modified User' }
  }),
  'erxes_remainders'
);

// for safeRemItemSchema query. increases search speed, avoids in-memory sorting
safeRemItemSchema.index({
  isDebit: 1,
  productId: 1,
  branchId: 1,
  departmentId: 1
});
