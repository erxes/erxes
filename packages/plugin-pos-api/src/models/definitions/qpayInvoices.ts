import { field, schemaHooksWrapper } from './util';
import { Document, Schema } from 'mongoose';
import { IQpayInvoiceModel } from '../QPayInvoices';
import { getDateFieldDefinition } from './utils';

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

const qpayUrlSchema = schemaHooksWrapper(
  new Schema({
    name: { type: String, label: 'Bank name' },
    description: { type: String, label: 'Bank description' },
    logo: { type: String, label: 'Bank logo' },
    link: { type: String, label: 'Bank payment link' }
  }),
  'erxes_qpayUrlSchema'
);

export interface IQpayInvoiceDocument extends IQPayInvoice, Document {
  _id: string;
}

export const qpayInvoiceSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    senderInvoiceNo: field({
      type: String,
      optional: true,
      label: 'Order id'
    }),
    amount: field({ type: String, optional: true, label: 'Amount' }),
    qpayInvoiceId: field({
      type: String,
      optional: true,
      label: 'QPay invoice id'
    }),
    qrText: field({ type: String, optional: true, label: 'QR text' }),
    qpayPaymentId: field({
      type: String,
      optional: true,
      label: 'QPay payment id'
    }),
    status: field({ type: String, default: 'open', label: 'Invoice status' }),
    paymentDate: field({
      type: Date,
      label: 'Updated Date for Qpay payment'
    }),
    urls: field({ type: qpayUrlSchema, label: 'QPay urls' }),
    createdAt: getDateFieldDefinition('Created at')
  }),
  'erxes_qpayInvoiceSchema'
);
