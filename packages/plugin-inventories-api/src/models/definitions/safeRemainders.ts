import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface ISafeRemainder {
  date: Date;
  description: string;

  status: string;
  branchId: string;
  departmentId: string;
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
  quantity: number;
  uomId: string;
  count: number;
  branchId: string;
  departmentId: string;
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
    status: field({ type: String, label: 'Status' }),
    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified date'
    }),
    lastTrDate: field({ type: Date, label: 'Last TR' }),

    productId: field({ type: String, index: true }),
    count: field({ type: Number, label: 'Remainder count' }),

    branchId: field({ type: String, label: 'Branch' }),
    departmentId: field({ type: String, label: 'Department' })
  }),
  'erxes_rem_items'
);

export const safeRemainderSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    date: field({ type: Date, label: 'Date' }),
    description: field({ type: String, label: 'Description' }),

    status: field({ type: String, label: 'Status' }),
    branchId: field({ type: String, label: 'Branch' }),
    departmentId: field({ type: String, label: 'Department' }),

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
