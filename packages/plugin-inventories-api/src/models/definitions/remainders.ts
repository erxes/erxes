import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IRemainderParams {
  departmentId?: string;
  branchId?: string;
  productId: string;
  uom?: string;
}

export interface IRemainderProductsParams {
  departmentId?: string;
  branchId?: string;
  categoryId?: string;

  searchValue?: string;
  page?: number;
  perPage?: number;
}

export interface IRemaindersParams {
  departmentIds?: string[];
  branchIds?: string[];
  productCategoryId?: string;
  productIds?: string[];
  searchValue?: string;
}

export interface IRemainderCount {
  _id: string;
  count: number;
  uom: string;
}

export interface IRemainder {
  branchId: string;
  departmentId: string;
  productId: string;
  count: number;
  soonIn?: number;
  soonOut?: number;
  shortLogs: any[];
}

export interface IRemainderDocument extends IRemainder, Document {
  _id: string;
  modifiedAt: Date;
}

export const remainderSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    branchId: field({ type: String, default: '', label: 'Branch' }),
    departmentId: field({ type: String, default: '', label: 'Department' }),

    status: field({ type: String, label: 'Status' }),
    productId: field({ type: String, index: true }),
    count: field({ type: Number, label: 'Count' }),
    soonIn: field({ type: Number, optional: true, label: 'Soon In' }),
    soonOut: field({ type: Number, optional: true, label: 'Soon Out' }),

    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified date'
    }),
    shortLogs: field({ type: [Object] })
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
