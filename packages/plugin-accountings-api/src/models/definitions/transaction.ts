import { Schema, Document } from 'mongoose';
import { field, schemaWrapper } from './utils';
import { PTR_STATUSES, TR_SIDES, TR_STATUSES } from './constants';

export interface ITrDetail {
  _id: string;
  accountId: string;
  transactionId: string;
  side: string;
  amount: number;
  currency: string;
  currencyAmount: number;
  customRate: number;

};

export interface ITransaction {
  date: Date;
  description: string;
  status: string;
  groupId: string;
  number: string;
  journal: string;
  parentId: string;
  ptrStatus: string;

  branchId: string;
  departmentId: string;
  customerType: string;
  customerId: string;


  details: ITrDetail[];
  createdBy: string;
  modifiedBy: string;
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export const transactionDetailSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    accountId: field({ type: String, label: 'Account' }),
    transactionId: field({ type: String, label: 'Transaction' }),
    side: field({
      type: String,
      enum: TR_SIDES.ALL,
      label: 'Side',
      default: 'new',
      index: true,
    }),
    amount: field({ type: Number, label: 'Amount' }),
    currency: field({ type: String, label: 'Currency' }),
    currencyAmount: field({ type: Number, label: 'CurrencyAmount' }),
    customRate: field({ type: Number, label: 'CustomRate' })
  })
);

export const transactionSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    date: field({ type: Date, label: 'Date' }),
    description: field({ type: String, optional: true, label: 'Description' }),
    status: field({
      type: String,
      enum: TR_STATUSES.ALL,
      label: 'Status',
      default: 'new',
      esType: 'keyword',
      index: true,
    }),
    groupId: field({ type: String, label: 'Group' }),
    number: field({ type: String, optional: true, label: 'Number', index: true }),
    journal: field({ type: String, label: 'Journal', index: true }),
    parentId: field({ type: String, optional: true, label: 'parentId', index: true }),
    ptrStatus: field({
      type: String,
      enum: PTR_STATUSES.ALL,
      label: 'PTR Status',
      default: 'zero',
      optional: true,
      esType: 'keyword',
      index: true,
    }),

    branchId: field({ type: String, label: 'Branch' }),
    departmentId: field({ type: String, label: 'Department' }),
    customerType: field({ type: String, label: 'Customer type' }),
    customerId: field({ type: String, label: 'Customer' }),

    details: field({ type: [transactionDetailSchema], label: 'details' }),

    createdBy: field({ type: String, label: 'Created user' }),
    modifiedBy: field({ type: String, label: 'Modified user' }),
    createdAt: field({ type: Date, default: new Date(), label: 'Created at' }),
    modifiedAt: field({ type: Date, label: 'Modified at' }),
  }),
);
