import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper, field } from './utils';
export interface ICalcDivideParams {
  contractId?: string;
  payDate: Date;
}

export interface ICalcTrParams {
  contractId: string;
  payDate: Date;
  total: number;
}

export interface ITransaction {
  number?: string;
  contractId?: string;
  customerId?: string;
  companyId?: string;
  transactionType: string;
  description?: string;
  payDate: Date;
  payment?: number;
  currency?: string;
  storedInterest?: number;
  total: number;
  balance?: number;
  contractReaction?: any;
  storeReaction?: any;
  isManual?: boolean;
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: string;
  createdAt?: Date;
  createdBy?: string;
}

export const transactionSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    number: field({
      type: String,
      label: 'Number',
      index: true
    }),
    contractId: field({
      type: String,
      optional: true,
      label: 'Contract',
      index: true
    }),
    customerId: field({
      type: String,
      optional: true,
      label: 'Customer',
      index: true
    }),
    companyId: field({
      type: String,
      optional: true,
      label: 'Company',
      index: true
    }),
    transactionType: field({
      type: String,
      optional: true,
      label: 'Transaction type'
    }),
    description: field({ type: String, optional: true, label: 'Description' }),
    payDate: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    }),
    payment: field({
      type: Number,
      min: 0,
      default: 0,
      optional: true,
      label: 'payment'
    }),
    storedInterest: field({
      type: Number,
      min: 0,
      default: 0,
      optional: true,
      label: 'stored interest'
    }),
    total: field({ type: Number, min: 0, default: 0, label: 'total' }),
    balance: field({ type: Number, min: 0, default: 0, label: 'balance' }),
    currency: field({
      type: String,
      default: 'MNT',
      label: 'transaction currency of saving'
    }),
    contractReaction: field({ type: Object, label: 'Contract reaction' }),
    storeReaction: field({ type: Object, label: 'Contract reaction' }),
    isManual: field({ type: Boolean, label: 'Is manual transaction' })
  }),
  'erxes_transactionSchema'
);
