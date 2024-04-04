import { Document, Schema } from 'mongoose';

import { PAYMENTS } from '../../api/constants';
import { field } from './utils';

export interface IPayment {
  name: string;
  kind: string;
  status: string;
  config: any;
}

export interface IPaymentDocument extends IPayment, Document {
  _id: string;
}

export const paymentSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  kind: field({
    type: String,
    required: true,
    label: 'Kind',
    enum: PAYMENTS.ALL
  }),
  status: field({ type: String, label: 'Status' }),
  config: field({ type: Object, label: 'Config' }),
  createdAt: field({ type: Date, default: new Date(), label: 'Created at' })
});
