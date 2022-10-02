import { Document, Schema } from 'mongoose';
import { PAYMENT_TYPES } from '../../../constants';
import { field } from './utils';

export interface IPaymentConfig {
  name: string;
  type: string;
  status: string;
  config: any;
}

export interface IPaymentConfigDocument extends IPaymentConfig, Document {
  _id: string;
}

export const paymentConfigSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  type: field({
    type: String,
    required: true,
    label: 'Type',
    enum: PAYMENT_TYPES.ALL
  }),
  status: field({ type: String, label: 'Status' }),
  config: field({ type: Object, label: 'Config' }),
  createdAt: field({ type: Date, default: new Date(), label: 'Created at' })
});
