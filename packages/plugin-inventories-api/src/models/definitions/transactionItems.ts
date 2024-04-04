import { Document, Schema } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface ITransactionItem {
  transactionId: string;
  productId: string;
  count: number;
  branchId: string;
  departmentId: string;
  isDebit: boolean;
  amount: number;
  assignedUserId?: string;
  discountAmount?: number;
  discountPercent?: number;
  bonusCount?: number;
  bonusVoucherId?: string;
}

export interface ITransactionItemDocument extends ITransactionItem, Document {
  _id: string;
  modifiedAt: string;
  modifiedBy: string;
}

export const transactionItemSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    transactionId: field({ type: String, index: true, label: 'Transaction' }),
    productId: { type: String, index: true },
    count: field({ type: Number, label: 'Count' }),

    branchId: field({ type: String, label: 'branch' }),
    departmentId: field({ type: String, label: 'department' }),
    isDebit: field({ type: Boolean, default: true, label: 'Is Debit' }),
    amount: field({ type: Number, label: 'amount' }),
    assignedUserId: field({ type: String, label: 'assignedUser' }),
    discountAmount: field({ type: Number, label: 'discountAmount' }),
    discountPercent: field({ type: Number, label: 'discountPercent' }),
    bonusCount: field({ type: Number, label: 'bonusCount' }),
    bonusVoucherId: field({ type: String, label: 'bonusVoucher' }),

    modifiedAt: { type: Date, default: new Date(), label: 'Modified date' },
    modifiedBy: { type: String, label: 'Modified by' }
  }),
  'erxes_transaction_items'
);

// for transactionSchema query. increases search speed, avoids in-memory sorting
transactionItemSchema.index({
  isDebit: 1,
  branchId: 1,
  departmentId: 1,
  productId: 1,
  transactionId: 1
});
