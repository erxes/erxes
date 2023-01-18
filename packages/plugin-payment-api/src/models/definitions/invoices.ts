import { PAYMENT_STATUS, PAYMENT_KINDS } from '../../constants';
import { Schema, Document } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';
import { makeInvoiceNo } from '../../utils';

export interface IInvoice {
  selectedPaymentId: string;
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
  paymentKind: string;

  apiResponse?: any;
  identifier: string;
}
export interface IInvoiceDocument extends IInvoice, Document {
  _id: string;
}

export const invoiceSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    identifier: field({
      type: String,
      index: true,
      label: 'Identifier'
    }),
    selectedPaymentId: field({
      type: String,
      label: 'payment id'
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
    paymentKind: field({
      type: String,
      label: 'payment kind',
      enum: PAYMENT_KINDS.ALL
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
