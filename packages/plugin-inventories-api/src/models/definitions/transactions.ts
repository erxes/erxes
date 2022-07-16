import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface ITrItem {
  transactionId: string;
  productId: string;
  branchId: string;
  departmentId: string;
  quantity: number;
  uomId: string;
  count: number;
  isDebit: boolean;
  amount: number;
}
export interface ITransaction {
  contentType: string;
  contentId: string;
  status: string;
  date: Date;
}

export interface ITrItemDocument extends ITrItem, Document {
  _id: string;
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
  createdBy: string;
  modifiedBy: string;
}

export const trItemSchema = schemaHooksWrapper(
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
  'erxes_tr_items'
);

export const transactionSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    date: field({ type: Date, label: 'Date' }),
    desctiption: field({ type: String, label: 'description' }),
    status: field({ type: String, label: 'Status' }),
    createdAt: { type: Date, default: new Date(), label: 'Created date' },
    createdBy: { type: String, label: 'Created User' },
    modifiedAt: { type: Date, default: new Date(), label: 'Modified date' },
    modifiedBy: { type: String, label: 'Modified User' },

    contentType: field({ type: String, label: 'Content Type' }),
    contentId: field({ type: String, label: 'Content' })
  }),
  'erxes_transactions'
);

// for transactionSchema query. increases search speed, avoids in-memory sorting
trItemSchema.index({
  isDebit: 1,
  productId: 1,
  branchId: 1,
  departmentId: 1
});

transactionSchema.index({
  contentType: 1,
  contentId: 1
});
