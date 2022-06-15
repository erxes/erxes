import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IRemainderParams {
  productId: string;
  departmentId?: string;
  branchId?: string;
  uomId?: string;
}

export interface IRemaindersParams {
  departmentId?: string;
  branchId?: string;
  productCategoryId?: string;
  productIds?: string[];
}

export interface IRemainder {
  productId: string;
  quantity: number;
  uomId: string;
  count: number;
  branchId: string;
  departmentId: string;
}

export interface IRemainderDocument extends IRemainder, Document {
  _id: string;
  modifiedAt: Date;
}

export interface IGetRemainder {
  _id: string;
  remainder: number;
  uomId: string;
}

export const remainderSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    status: field({ type: String, label: 'Status' }),
    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified date'
    }),

    productId: field({ type: String, index: true }),
    count: field({ type: Number, label: 'Remainder count' }),

    branchId: field({ type: String, default: '', label: 'Branch' }),
    departmentId: field({ type: String, default: '', label: 'Department' })
  }),
  'erxes_transactions'
);

// for remainderSchema query. increases search speed, avoids in-memory sorting
remainderSchema.index({
  isDebit: 1,
  productId: 1,
  branchId: 1,
  departmentId: 1
});
