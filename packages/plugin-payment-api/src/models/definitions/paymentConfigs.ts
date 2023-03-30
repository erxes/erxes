import { Document, Schema } from 'mongoose';

import { field } from './utils';

export interface IPaymentConfig {
  contentType: string;
  contentTypeId: string;
  paymentIds: string[];
}

export interface IPaymentConfigDocument extends IPaymentConfig, Document {
  _id: string;
}

export const paymentConfigSchema = new Schema({
  _id: field({ pkey: true }),
  contentType: field({ type: String, label: 'Content type' }),
  contentTypeId: field({ type: String, label: 'Content type id' }),
  paymentIds: field({ type: [String], label: 'Payment ids' })
});
