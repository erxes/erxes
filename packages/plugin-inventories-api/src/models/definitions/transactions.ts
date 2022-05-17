import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

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

export const transactionSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    status: field({ type: String, label: 'Status' }),
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
    departmentId: field({ type: String, label: 'Department' })
  }),
  'erxes_transactions'
);

// for transactionSchema query. increases search speed, avoids in-memory sorting
transactionSchema.index({
  isDebit: 1,
  productId: 1,
  branchId: 1,
  departmentId: 1
});
