import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface ISafeRemainderItem {
  remainderId: string;
  productId: string;
  branchId: string;
  departmentId: string;

  preCount: number;
  count: number;
  status: string;

  uomId: string;
}

export interface ISafeRemainderItemDocument
  extends ISafeRemainderItem,
    Document {
  _id: string;
  modifiedAt: Date;
  lastTransactionDate: Date;
}

export const safeRemainderItemSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    remainderId: field({ type: String }),
    productId: field({ type: String, index: true }),
    branchId: field({ type: String, default: '', label: 'Branch' }),
    departmentId: field({ type: String, default: '', label: 'Department' }),

    preCount: field({ type: Number, label: 'Pre count' }),
    count: field({ type: Number, label: 'Remainder count' }),

    status: field({ type: String, label: 'Status' }),

    lastTransactionDate: field({ type: Date, label: 'Last Transaction Date' }),
    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified date'
    })
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
