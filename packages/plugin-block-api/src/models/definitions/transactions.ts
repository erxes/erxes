import { Document, Schema } from 'mongoose';
import { TRANSACTION_SELECT_OPTIONS } from './constants';
import { field } from './utils';

const getEnum = (fieldName: string): string[] => {
  return TRANSACTION_SELECT_OPTIONS[fieldName].map(option => option.value);
};

export interface ITransaction {
  erxesCustomerId: string;
  type: string;
  status: string;
}

export interface ITransactionDocument extends ITransaction, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export const transactionSchema = new Schema({
  _id: field({ pkey: true }),
  erxesCustomerId: field({
    type: String,
    label: 'Customer'
  }),
  type: field({
    type: String,
    enum: getEnum('TYPE'),
    default: '',
    optional: true,
    label: 'Type',
    esType: 'keyword',
    selectOptions: TRANSACTION_SELECT_OPTIONS.TYPE
  }),
  status: field({
    type: String,
    label: 'Status',
    default: 'processing'
  }),
  createdAt: field({
    type: Date,
    default: Date.now,
    label: 'Created at'
  }),
  modifiedAt: field({ type: Date, label: 'Modified at' })
});
