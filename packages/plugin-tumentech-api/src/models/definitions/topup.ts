import { Document, Schema } from 'mongoose';

import { field, schemaHooksWrapper } from './utils';

export interface ITopup {
  customerId: string;
  amount: number;
  invoiceId: string;
  createdAt: Date;
}

export interface ITopupDocument extends ITopup, Document {
  _id: string;
}

export const topupSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    customerId: field({ type: String, label: 'Customer Id', required: true }),
    amount: field({ type: Number, label: 'Amount', required: true }),
    invoiceId: field({ type: String, label: 'Invoice Id', required: true }),
    ebarimtData: field({ type: Object, label: 'Ebarimt Data' }),
    createdAt: field({ type: Date, label: 'Created At', default: Date.now })
  }),
  'tumentech_topups'
);

topupSchema.index({ customerId: 1, invoiceId: 1 });
