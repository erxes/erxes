import { Schema, Document } from 'mongoose';
import {
  field,
  schemaHooksWrapper
} from '../../../../models/definitions/utils';

export interface ISocialPayInvoice {
  invoiceNo: string;
  amount: string;
  phone: string;
  qrText: string;
  status: string;
  companyId: string;
  customerId: string;
  contentType: string;
  contentTypeId: string;
  createdAt: Date;
}
export interface ISocialPayInvoiceDocument extends ISocialPayInvoice, Document {
  _id: string;
}

export const socialPayInvoiceSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    invoiceNo: field({ type: String, optional: true, unique: true }),
    amount: field({ type: String, optional: true, label: 'amount' }),
    phone: field({ type: String, optional: true, label: 'phone' }),
    qrText: field({ type: String, optional: true, label: 'qr text' }),
    status: field({ type: String, default: 'open', label: 'qr text' }),
    companyId: field({ type: String, label: 'company id' }),
    customerId: field({ type: String, label: 'customer id' }),
    contentType: field({ type: String, label: 'content type' }),
    contentTypeId: field({ type: String, label: 'content type id' }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created Date for new invoice'
    })
  }),
  'erxes_socialPayInvoice'
);
