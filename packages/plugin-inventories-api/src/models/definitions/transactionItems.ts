import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface ITransactionItem {
  branchId: string;
  departmentId: string;
  transactionId: string;
  productId: string;
  count: number;
  uomId: string;
  isDebit: boolean;
}

export interface ITransactionItemDocument extends ITransactionItem, Document {
  _id: string;
  modifiedAt: string;
}

export const transactionItemSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),

    branchId: field({ type: String, default: '', label: 'Branch' }),
    departmentId: field({ type: String, default: '', label: 'Department' }),
    transactionId: field({ type: String, label: 'Transaction ID' }),
    productId: { type: String, index: true },
    count: field({ type: Number, label: 'Count' }),
    uomId: field({ type: String, label: 'UOM' }),
    isDebit: field({ type: Boolean, default: true, label: 'Is Debit' }),

    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified date'
    })
  }),
  'erxes_transaction_items'
);

// for transactionSchema query. increases search speed, avoids in-memory sorting
transactionItemSchema.index({
  isDebit: 1,
  productId: 1,
  transactionId: 1
});
