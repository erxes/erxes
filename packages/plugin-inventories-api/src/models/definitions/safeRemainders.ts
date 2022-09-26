import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface ISafeRemainderSubmitParams {
  branchId: string;
  departmentId: string;
  status: string;
  contentType: string;
  contentId: string;
  products: any[];
}

export interface ISafeRemaindersParams {
  beginDate?: Date;
  endDate?: Date;
  productId?: string;
  branchId?: string;
  departmentId?: string;

  searchValue?: string;
  page?: number;
  perPage?: number;
}

export interface ISafeRemainder {
  branchId: string;
  departmentId: string;
  productCategoryId: string;
  date: Date;
  description?: string;
  status: string;
}

export interface ISafeRemainderDocument extends ISafeRemainder, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}

export const safeRemainderSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),

    branchId: field({ type: String, default: '', label: 'Branch' }),
    departmentId: field({ type: String, default: '', label: 'Department' }),
    productCategoryId: field({ type: String, label: 'Product Category' }),
    date: field({ type: Date, label: 'Date' }),
    description: field({ type: String, label: 'Description' }),
    status: field({ type: String, label: 'Status' }),

    createdAt: { type: Date, default: new Date(), label: 'Created date' },
    createdBy: { type: String, label: 'Created User' },
    modifiedAt: { type: Date, default: new Date(), label: 'Modified date' },
    modifiedBy: { type: String, label: 'Modified User' }
  }),
  'erxes_safe_remainders'
);
