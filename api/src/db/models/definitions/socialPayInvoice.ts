import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface ISocialPayInvoice {
  status: string;
  amount: number;
  invoiceNo: string;
  phone: string;
}

export interface ISocialPayInvoiceDocument extends ISocialPayInvoice, Document {
  _id: string;
  createdAt: Date;
}

export const socialPayInvoiceSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    amount: field({ type: Number, label: 'Amount' }),
    createdAt: field({ type: Date, label: 'Created at' }),
    status: field({ type: String, label: 'Status' }),
    invoiceNo: field({ type: String, label: 'Invoice no' }),
    phone: field({ type: String, label: 'Phone' })
  })
);
