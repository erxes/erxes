import { Schema, Document } from 'mongoose';
import { field, schemaWrapper } from './utils';
import { JOURNALS, PTR_STATUSES, TR_SIDES, TR_STATUSES } from './constants';

export interface ITrDetail {
  _id: string;
  accountId: string;
  transactionId: string;
  side: string;
  amount: number;
  currency?: string;
  currencyAmount?: number;
  customRate?: number;

  productId?: string;
  count?: number;
  unitPrice?: number;
};

export interface ITransaction {
  date: Date;
  description: string;
  status: string;
  ptrId?: string;
  parentId?: string;
  number?: string;
  journal: string;
  ptrStatus?: string;

  branchId?: string;
  departmentId?: string;
  customerType?: string;
  customerId?: string;


  details: ITrDetail[];
  sumDt: number;
  sumCt: number;
  createdBy?: string;
  modifiedBy?: string;
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: string;

  ptrId: string;
  parentId: string;
  number: string;
  ptrStatus: string;

  createdAt: Date;
  modifiedAt?: Date;
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
    currency: field({ type: String, optional: true, label: 'Currency' }),
    currencyAmount: field({ type: Number, optional: true, label: 'CurrencyAmount' }),
    customRate: field({ type: Number, optional: true, label: 'CustomRate' }),

    productId: field({ type: String, optional: true, label: 'Product' }),
    count: field({ type: Number, optional: true, label: 'Count' }),
    unitPrice: field({ type: Number, optional: true, label: 'unitPrice' }),
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
      index: true,
    }),
    ptrId: field({ type: String, label: 'Group' }),
    parentId: field({ type: String, optional: true, label: 'parentId', index: true }),
    number: field({ type: String, optional: true, label: 'Number', index: true }),
    journal: field({
      type: String,
      enum: JOURNALS.ALL,
      default: 'zero',
      label: 'Journal',
      index: true
    }),
    ptrStatus: field({
      type: String,
      enum: PTR_STATUSES.ALL,
      default: 'zero',
      label: 'PTR Status',
      optional: true,
      index: true,
    }),

    branchId: field({ type: String, optional: true, label: 'Branch' }),
    departmentId: field({ type: String, optional: true, label: 'Department' }),
    customerType: field({ type: String, optional: true, label: 'Customer type' }),
    customerId: field({ type: String, optional: true, label: 'Customer' }),

    details: field({ type: [transactionDetailSchema], label: 'details' }),
    sumDt: field({ type: Number, label: 'sumDt' }),
    sumCt: field({ type: Number, label: 'sumCt' }),

    createdBy: field({ type: String, label: 'Created user' }),
    modifiedBy: field({ type: String, optional: true, label: 'Modified user' }),
    createdAt: field({ type: Date, default: new Date(), label: 'Created at' }),
    modifiedAt: field({ type: Date, optional: true, label: 'Modified at' }),
  }),
);
