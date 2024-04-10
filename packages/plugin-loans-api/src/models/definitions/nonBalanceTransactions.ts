import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper, field } from './utils';

export interface INonBalanceTransaction {
  number?: string;
  transactionType?: string;
  contractId?: string;
  customerId?: string;
  description?: string;
  detail:[IDetail]
}

export interface IDetail {
  ktAmount?: number;
  dtAmount?:  number;
  type: string;
  currency: string;
}

export interface INonBalanceTransactionDocument extends INonBalanceTransaction, Document {
  _id: string;
  createdAt?: Date;
  createdBy?: string;
}

const INonBalanceDetail = new Schema({
  ktAmount: field({ type: Number, optional: true, label: 'kt Amount' }),
  dtAmount: field({ type: Number, optional: true, label: 'dt Amount' }),
  type: field({ type: String, optional: true, label: 'detail type' }),
  currency: field({
    type: String,
    default: 'MNT',
    label: ' Non Balance transaction currency of lease'
  }),
})

export const nonBalanceTransactionSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    number: field({
      type: String,
      label: 'Number',
      index: true
    }),
    transactionType: field({
      type: String,
      label: 'Non Balance Transaction Type'
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
    description: field({ type: String, optional: true, label: 'Description' }),
    createdAt: field({
      type: Date,
      default: () => new Date(),
      label: 'Created at'
    }),
    createdBy: { type: String, optional: true, label: 'created member' },
    detail:field({ type: [INonBalanceDetail], optional: true, label: 'detail' })
  }),
  'erxes_nonBalanceTransactionSchema'
);
