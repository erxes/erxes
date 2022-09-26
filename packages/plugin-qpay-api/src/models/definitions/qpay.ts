import { Schema, Document } from 'mongoose';
import { field, schemaHooksWrapper } from './utils';

export interface IQpayInvoice {
  senderInvoiceNo: String;
  amount: String;
  qpayInvoiceId: String;
  qrText: String;
  qpayPaymentId: String;
  status: String;
  createdAt: Date;
}

export interface IQpayInvoiceDocument extends IQpayInvoice, Document {
  _id: string;
}
export interface ISocialPayInvoice {
  invoiceNo: String;
  amount: String;
  phone: String;
  qrText: String;
  status: String;
  createdAt: Date;
}
export interface ISocialPayInvoiceDocument extends ISocialPayInvoice, Document {
  _id: string;
}

export const qpayInvoiceSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    senderInvoiceNo: field({ type: String, optional: true, unique: true }),
    amount: field({ type: String, optional: true, label: 'amount' }),
    qpayInvoiceId: field({
      type: String,
      optional: true,
      label: 'new invoiceId'
    }),
    qrText: field({
      type: String,
      optional: true,
      label: 'new qrText for qpay Invoice'
    }),
    qpayPaymentId: field({
      type: String,
      optional: true,
      label: 'new paymentId'
    }),
    status: field({ type: String, default: 'open', label: 'qr text' }),
    paymentDate: field({
      type: Date,
      label: 'Updated Date for Qpay payment'
    }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created Date for new invoice'
    })
  }),
  'erxes_qpayInvoice'
);

export const socialPayInvoiceSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    invoiceNo: field({ type: String, optional: true, unique: true }),
    amount: field({ type: String, optional: true, label: 'amount' }),
    phone: field({ type: String, optional: true, label: 'phone' }),
    qrText: field({ type: String, optional: true, label: 'qr text' }),
    status: field({ type: String, default: 'open', label: 'qr text' }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created Date for new invoice'
    })
  }),
  'erxes_socialPayInvoice'
);
