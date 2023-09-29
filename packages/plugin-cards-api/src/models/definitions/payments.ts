import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IPaymentType {
  _id?: string;
  status: string;
  paymentIds?: string[];
  paymentTypes?: any[];
  erxesAppToken?: string;
}

export interface IPaymentTypeDocument extends IPaymentType, Document {
  _id: string;
  status: string;
  createdBy: string;
  createdAt: Date;
}
export const paymentTypeSchema = new Schema({
  _id: field({ pkey: true }),
  paymentIds: field({ type: [String], label: 'Online Payments' }),
  paymentTypes: field({ type: [Object], label: 'Other Payments' }),
  erxesAppToken: field({ type: String, label: 'Erxes app token' }),
  status: field({ type: String, label: 'Status' }),
  createdBy: field({ type: String, label: 'Created by' }),
  createdAt: field({ type: Date, label: 'Created at' })
});
