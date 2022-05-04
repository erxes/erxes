import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
import { IProductsData } from './jobs';

export interface ITransaction {
  yieldId: string;
  productId: string;
  quantity: number;
  uomId: string;
  count: number;
  isDebit: boolean;
  amount: number;
  branchId: string;
  departmentId: string;
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: string;
  createdAt: Date;
  createdBy: string;
}

export const transactionsSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: { type: Date, default: new Date(), label: 'Created date' },
    createdBy: { type: String, label: 'Created User' },

    yieldId: { type: String, optional: true },
    productId: { type: String, index: true },
    quantity: field({ type: Number, label: 'Quantity' }),
    uomId: field({ type: String, label: 'UOM' }),

    count: field({ type: Number, label: 'Main count' }),

    isDebit: field({ type: Boolean, default: true, label: 'Is Debit' }),
    amount: field({ type: Number, label: 'Amount' }),
    branchId: field({ type: String, label: 'Branch' }),
    departmentId: field({ type: String, label: 'Department' }),
  }),
  'erxes_transactions'
);

// for transactionsSchema query. increases search speed, avoids in-memory sorting
transactionsSchema.index({
  isDebit: 1,
  productId: 1,
  branchId: 1,
  departmentId: 1
});



