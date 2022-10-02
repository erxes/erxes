import { Schema, Document } from 'mongoose';
import {
  field,
  schemaHooksWrapper
} from '../../../../models/definitions/utils';

export interface IQpayInvoice {
  senderInvoiceNo: string;
  amount: string;
  qpayInvoiceId: string;
  paymentId: string;
  qrText: string;
  qpayPaymentId: string;
  status: string;
  companyId: string;
  customerId: string;
  contentType: string;
  contentTypeId: string;
  searchValue: string;
  createdAt: Date;
}

export interface IQpayInvoiceDocument extends IQpayInvoice, Document {
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
    paymentId: field({ type: String, label: 'payment config id' }),
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
    companyId: field({ type: String, label: 'company id' }),
    customerId: field({ type: String, label: 'customer id' }),
    contentType: field({ type: String, label: 'content type' }),
    contentTypeId: field({ type: String, label: 'content type id' }),
    searchValue: field({ type: String, label: 'search value' }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created Date for new invoice'
    })
  }),
  'erxes_qpayInvoice'
);
