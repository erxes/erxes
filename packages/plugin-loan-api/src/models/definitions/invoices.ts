import { INVOICE_STATUS } from './constants';
import { Document, Schema } from 'mongoose';
import { schemaHooksWrapper, field } from './utils';
export interface IInvoice {
  contractId: string;
  createdAt: Date;
  createdBy?: string;
  customerId?: string;
  companyId?: string;
  number: string;
  status: string;
  payDate: Date;
  payment: number;
  interestEve: number;
  interestNonce: number;
  undue: number;
  insurance: number;
  debt: number;
  total: number;
}

export interface IInvoiceDocument extends IInvoice, Document {
  _id: string;
}

export const invoiceSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    contractId: field({ type: String, label: 'Contract', index: true }),
    customerId: field({
      type: String,
      optional: true,
      label: 'Customer',
      index: true
    }),
    companyId: field({
      type: String,
      optional: true,
      label: 'Company',
      index: true
    }),
    number: field({ type: String, label: 'Invoice number', index: true }),
    status: field({
      type: String,
      label: 'Status',
      enum: INVOICE_STATUS.ALL,
      required: true,
      default: INVOICE_STATUS.PENDING
    }),
    payDate: field({
      type: Date,
      default: new Date(),
      label: 'Created at',
      index: true
    }),
    payment: field({ type: Number, min: 0, label: 'payment' }),
    interestEve: field({ type: Number, min: 0, label: 'interest eve' }),
    interestNonce: field({ type: Number, min: 0, label: 'interest nonce' }),
    undue: field({ type: Number, min: 0, label: 'undue' }),
    insurance: field({ type: Number, min: 0, label: 'insurance' }),
    debt: field({ type: Number, min: 0, label: 'debt' }),
    total: field({ type: Number, min: 0, label: 'total' }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at'
    }),
    createdBy: field({ type: String, optional: true, label: 'created member' })
  }),
  'erxes_invoiceSchema'
);
