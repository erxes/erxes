import { PAYMENT_STATUS, PAYMENT_TYPES } from '../../../constants';
import { Schema, Document } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IInvoice {
  paymentConfigId: string;
  amount: number;
  phone: string;
  email: string;
  description?: string;
  status: string;
  companyId: string;
  customerId: string;
  contentType: string;
  contentTypeId: string;
  createdAt: Date;
  resolvedAt?: Date;

  apiResponse?: any;
}
export interface IInvoiceDocument extends IInvoice, Document {
  _id: string;
}

export const invoiceSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    paymentConfigId: field({
      type: String,
      required: true,
      label: 'payment config id'
    }),
    amount: field({ type: Number, required: true, label: 'amount' }),
    phone: field({ type: String, optional: true, label: 'phone' }),
    email: field({ type: String, optional: true, label: 'email' }),
    description: field({ type: String, optional: true, label: 'description' }),
    status: field({
      type: String,
      default: PAYMENT_STATUS.PENDING,
      label: 'status',
      enum: PAYMENT_STATUS.ALL
    }),
    companyId: field({ type: String, label: 'company id' }),
    customerId: field({ type: String, label: 'customer id' }),
    contentType: field({ type: String, label: 'content type' }),
    contentTypeId: field({ type: String, label: 'content type id' }),
    apiResponse: field({
      type: Object,
      optional: true,
      label: 'provider response'
    }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created Date for new invoice'
    }),
    resolvedAt: field({
      type: Date,
      optional: true,
      label: 'Resolved Date for invoice'
    })
  }),
  'erxes_invoices'
);
