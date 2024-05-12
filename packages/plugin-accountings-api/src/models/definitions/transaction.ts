import { Schema, Document } from 'mongoose';
import { field, schemaWrapper } from './utils';
import { JOURNALS, PTR_STATUSES, TR_SIDES, TR_STATUSES } from './constants';

export interface IMainTrInput {
  ptrId: string
  parentId: string
  number: string
  date: Date
  description: string
  journal: string

  branchId: string
  departmentId: string
  customerType: string
  customerId: string
  assignedUserIds?: [string]

  accountId: string
  side: string
  amount: number;
}

export interface ISingleTrInput extends IMainTrInput {
  currencyAmount?: number;
  customRate?: number;
  currencyDiffAccountId?: string;

  hasVat: boolean;
  vatRowId?: string;
  afterVat?: boolean;
  afterVatAccountId?: string;
  isHandleVat?: boolean;
  vatAmount?: number;

  hasCtax: boolean;
  ctaxRowId?: string;
  isHandleCtax?: boolean;
  ctaxAmount?: number;
}

export interface ICashTrInput extends ISingleTrInput { }
export interface IFundTrInput extends ISingleTrInput { }
export interface IDebtTrInput extends ISingleTrInput { }

export interface ITrDetail {
  _id: string;
  accountId: string;
  originId?: string;
  follows?: {
    type: string;
    id: string;
  }[];

  side: string;
  amount: number;
  currency?: string;
  currencyAmount?: number;
  customRate?: number;
  assignedUserId?: string;

  productId?: string;
  count?: number;
  unitPrice?: number;
};

export interface ITransaction {
  date: Date;
  description: string;
  status?: string;
  ptrId?: string;
  parentId?: string;
  number?: string;
  journal: string;
  ptrStatus?: string;
  originId?: string;
  follows?: {
    type: string;
    id: string;
  }[];
  preTrId?: string;

  branchId?: string;
  departmentId?: string;
  customerType?: string;
  customerId?: string;
  assignedUserIds?: string[];

  details: ITrDetail[];
  shortDetail?: ITrDetail;
  createdBy?: string;
  modifiedBy?: string;
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: string;

  ptrId: string;
  parentId: string;
  number: string;
  status: string;
  ptrStatus: string;

  createdAt: Date;
  modifiedAt?: Date;

  sumDt: number;
  sumCt: number;
}

export const transactionDetailSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    accountId: field({ type: String, label: 'Account', index: true }),
    follows: field({
      type: [{
        type: String,
        id: String,
      }], label: 'Follower transactions'
    }),

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

    assignUserId: field({ type: String, optional: true, esType: 'keyword' }), // AssignUserId

    productId: field({ type: String, optional: true, label: 'Product' }),
    count: field({ type: Number, optional: true, label: 'Count' }),
    unitPrice: field({ type: Number, optional: true, label: 'unitPrice' }),
  })
);

export const followInfoSchema = schemaWrapper(
  new Schema({
    id: field({ type: String, index: true }),
    type: field({ type: String }),
  })
)
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
    originId: field({ type: String, label: 'Group' }),
    follows: field({
      type: [followInfoSchema], label: 'Follower transactions'
    }),
    preTrId: field({ type: String, optional: true, label: 'previous transaction', index: true }),

    branchId: field({ type: String, optional: true, label: 'Branch' }),
    departmentId: field({ type: String, optional: true, label: 'Department' }),
    customerType: field({ type: String, optional: true, label: 'Customer type' }),
    customerId: field({ type: String, optional: true, label: 'Customer' }),
    assignedUserIds: field({ type: [String], label: 'Assign Users' }),

    details: field({ type: [transactionDetailSchema], label: 'details' }),
    shortDetail: field({ type: transactionDetailSchema, label: 'short detail' }),
    sumDt: field({ type: Number, label: 'sumDt' }),
    sumCt: field({ type: Number, label: 'sumCt' }),

    createdBy: field({ type: String, label: 'Created user' }),
    modifiedBy: field({ type: String, optional: true, label: 'Modified user' }),
    createdAt: field({ type: Date, default: new Date(), label: 'Created at' }),
    modifiedAt: field({ type: Date, optional: true, label: 'Modified at' }),
  }),
);
