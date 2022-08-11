import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface ISafeRemainderItem {
  branchId: string;
  departmentId: string;
  remainderId: string;
  productId: string;

  preCount: number;
  count: number;
  status: string;

  lastTransactionDate: Date;
}

export interface ISafeRemainderItemDocument
  extends ISafeRemainderItem,
    Document {
  _id: string;
  modifiedAt: Date;
  modifiedBy: string;
}

export const safeRemainderItemSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    branchId: field({ type: String, default: '', label: 'Branch' }),
    departmentId: field({ type: String, default: '', label: 'Department' }),
    remainderId: field({ type: String }),
    productId: field({ type: String, index: true }),

    preCount: field({ type: Number, label: 'Pre count' }),
    count: field({ type: Number, label: 'Remainder count' }),

    status: field({ type: String, label: 'Status' }),
    uomId: field({ type: String, label: 'UOM ID' }),

    lastTransactionDate: field({ type: Date, label: 'Last Transaction Date' }),
    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified date'
    }),
    modifiedBy: { type: String, label: 'Modified User' }
  }),
  'erxes_safe_remainder_items'
);

// for safeRemainderItemSchema query. increases search speed, avoids in-memory sorting
safeRemainderItemSchema.index({
  isDebit: 1,
  productId: 1,
  branchId: 1,
  departmentId: 1
});
