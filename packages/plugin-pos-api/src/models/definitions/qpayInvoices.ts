import { Document, Schema } from 'mongoose';
import { IQpayInvoiceModel } from '../QPayInvoices';
import { getDateFieldDefinition } from './utils';
import { field, schemaHooksWrapper } from './util';

interface IQPayUrl {
  name: string;
  description: string;
  logo: string;
  link: string;
}

export interface IQPayInvoice {
  senderInvoiceNo?: string;
  amount: string;
  qpayInvoiceId?: string;
  qrText?: string;
  qpayPaymentId?: string;
  paymentDate?: Date;
  createdAt?: Date;
  status?: string;
  urls?: IQPayUrl[];
}

const qpayUrlSchema = new Schema({
  name: { type: String, label: 'Bank name' },
  description: { type: String, label: 'Bank description' },
  logo: { type: String, label: 'Bank logo' },
  link: { type: String, label: 'Bank payment link' }
});

export interface IQpayInvoiceDocument extends IQPayInvoice, Document {
  _id: string;
}

export const qpayInvoiceSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    senderInvoiceNo: {
      type: String,
      optional: true,
      label: 'Order id'
    },
    amount: { type: String, optional: true, label: 'Amount' },
    qpayInvoiceId: {
      type: String,
      optional: true,
      label: 'QPay invoice id'
    },
    qrText: { type: String, optional: true, label: 'QR text' },
    qpayPaymentId: {
      type: String,
      optional: true,
      label: 'QPay payment id'
    },
    status: { type: String, default: 'open', label: 'Invoice status' },
    paymentDate: {
      type: Date,
      label: 'Updated Date for Qpay payment'
    },
    urls: { type: qpayUrlSchema, label: 'QPay urls' },
    createdAt: getDateFieldDefinition('Created at')
  }),
  'erxes_qpayInvoiceSchema'
);
