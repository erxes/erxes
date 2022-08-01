import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IRemainderParams {
  departmentId?: string;
  branchId?: string;
  productId: string;
  uomId?: string;
}

export interface IRemaindersParams {
  departmentId?: string;
  branchId?: string;
  productCategoryId?: string;
  productIds?: string[];
}

export interface IRemainder {
  branchId: string;
  departmentId: string;
  productId: string;
  count: number;
  uomId: string;
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
    productId: field({ type: String, index: true }),
    count: field({ type: Number, label: 'Count' }),

    branchId: field({ type: String, default: '', label: 'Branch' }),
    departmentId: field({ type: String, default: '', label: 'Department' }),

    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified date'
    })
  }),
  'erxes_remainders'
);

// for remainderSchema query. increases search speed, avoids in-memory sorting
remainderSchema.index({
  isDebit: 1,
  productId: 1,
  branchId: 1,
  departmentId: 1
});
