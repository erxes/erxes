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
  order: number;
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
    remainderId: field({ type: String, index: true }),
    productId: field({ type: String, index: true }),

    preCount: field({ type: Number, label: 'Pre count' }),
    count: field({ type: Number, label: 'Remainder count' }),

    status: field({ type: String, label: 'Status' }),
    uom: field({ type: String, label: 'UOM' }),
    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified date'
    }),
    modifiedBy: { type: String, label: 'Modified User' },
    order: field({ type: Number, index: true })
  }),
  'erxes_safe_remainder_items'
);

// for safeRemainderItemSchema query. increases search speed, avoids in-memory sorting
safeRemainderItemSchema.index({
  remainderId: 1,
  productId: 1,
  branchId: 1,
  departmentId: 1
});
