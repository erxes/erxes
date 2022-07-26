import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface ISafeRemainderItem {
  remainderId: string;
  productId: string;
  branchId: string;
  departmentId: string;

  preCount: number;
  count: number;
  uomId: string;

  status: string;
}

export interface ISafeRemainderItemDocument
  extends ISafeRemainderItem,
    Document {
  _id: string;
  modifiedAt: Date;
  lastTrDate: Date;
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

    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified date'
    }),
    lastTrDate: field({ type: Date, label: 'Last TR' })
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
