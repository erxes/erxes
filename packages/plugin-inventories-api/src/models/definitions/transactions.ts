import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface ITransactionCreateParams extends ITransaction {
  products: {
    productId: string;
    count: number;
    preCount: number;
    uomId: string;
    isDebit: boolean;
  }[];
}

export interface ITransaction {
  branchId: string;
  departmentId: string;
  status: string;
  contentType: string;
  contentId: string;
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: string;
  createdAt: Date;
}

export const transactionSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),

    branchId: field({ type: String, default: '', label: 'Branch' }),
    departmentId: field({ type: String, default: '', label: 'Department' }),

    status: field({ type: String, label: 'Status' }),
    contentType: field({ type: String, label: 'Content Type' }),
    contentId: field({ type: String, label: 'Content ID' }),

    createdAt: { type: Date, default: new Date(), label: 'Created date' }
  }),
  'erxes_transactions'
);

// for transactionSchema query. increases search speed, avoids in-memory sorting
transactionSchema.index({
  branchId: 1,
  departmentId: 1,
  contentType: 1,
  contentId: 1
});
