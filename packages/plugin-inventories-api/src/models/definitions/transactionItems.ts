import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface ITransactionItem {
  transactionId: string;
  productId: string;
  branchId: string;
  departmentId: string;
  quantity: string;
  uomId: string;
  count: number;
  isDebit: boolean;
  amount: number;
}

export interface ITransactionItemDocument extends ITransactionItem, Document {
  _id: string;
}

export const transactionItemSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    status: field({ type: String, label: 'Status' }),
    transactionId: field({ type: String, label: 'transaction' }),
    createdAt: { type: Date, default: new Date(), label: 'Created date' },
    createdBy: { type: String, label: 'Created User' },

    productId: { type: String, index: true },
    branchId: field({ type: String, default: '', label: 'Branch' }),
    departmentId: field({ type: String, default: '', label: 'Department' }),

    quantity: field({ type: Number, label: 'Quantity' }),
    uomId: field({ type: String, label: 'UOM' }),
    count: field({ type: Number, label: 'Main count' }),

    isDebit: field({ type: Boolean, default: true, label: 'Is Debit' }),
    amount: field({ type: Number, label: 'Amount' })
  }),
  'erxes_transaction_items'
);

// for transactionSchema query. increases search speed, avoids in-memory sorting
transactionItemSchema.index({
  isDebit: 1,
  productId: 1,
  branchId: 1,
  departmentId: 1
});
