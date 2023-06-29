import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper, field } from './utils';

interface IGeneralRow {
  amount: number;
  account: string;
  side: 'kt' | 'dt';
}

export interface IGeneral {
  contractId?: string;
  customerId?: string;
  customerCode?: string;
  transactionId?: string;
  description?: string;
  payDate: Date;
  generalNumber: string;
  amount?: number;
  periodLockId: string;
  dtl?: IGeneralRow[];
}

export interface IGeneralDocument extends IGeneral, Document {
  _id: string;
  createdAt?: Date;
  createdBy?: string;
}

export const generalSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    contractId: field({
      type: String,
      optional: true,
      label: 'Contract',
      index: true
    }),
    customerId: field({
      type: String,
      optional: true,
      label: 'Contract',
      index: true
    }),
    customerCode: field({
      type: String,
      optional: true,
      label: 'Customer Code',
      index: true
    }),
    transactionId: field({
      type: String,
      optional: true,
      label: 'Contract',
      index: true
    }),
    periodLockId: field({
      type: String,
      optional: true,
      label: 'Contract',
      index: true
    }),
    description: field({
      type: String,
      optional: true,
      label: 'Contract',
      index: true
    }),
    payDate: field({
      type: String,
      optional: true,
      label: 'Contract',
      index: true
    }),
    generalNumber: field({
      type: String,
      optional: true,
      label: 'Contract',
      index: true
    }),
    amount: field({
      type: String,
      optional: true,
      label: 'Contract',
      index: true
    }),
    dtl: field({
      type: [{ amount: Number, account: String, side: String }],
      optional: true,
      label: 'Contract',
      index: true
    })
  }),
  'erxes_generalSchema'
);
