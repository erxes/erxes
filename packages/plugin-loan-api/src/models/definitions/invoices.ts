import { INVOICE_STATUS } from './constants';
import { Document } from 'mongoose';
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

export const invoiceSchema = {
  _id: { pkey: true },
  contractId: { type: String, label: 'Contract', index: true },
  customerId: { type: String, optional: true, label: 'Customer', index: true },
  companyId: { type: String, optional: true, label: 'Company', index: true },
  number: { type: String, label: 'Invoice number', index: true },
  status: {
    type: String,
    label: 'Status',
    enum: INVOICE_STATUS.ALL,
    required: true,
    default: INVOICE_STATUS.PENDING,
  },
  payDate: {
    type: Date,
    default: new Date(),
    label: 'Created at',
    index: true,
  },
  payment: { type: Number, min: 0, label: 'payment' },
  interestEve: { type: Number, min: 0, label: 'interest eve' },
  interestNonce: { type: Number, min: 0, label: 'interest nonce' },
  undue: { type: Number, min: 0, label: 'undue' },
  insurance: { type: Number, min: 0, label: 'insurance' },
  debt: { type: Number, min: 0, label: 'debt' },
  total: { type: Number, min: 0, label: 'total' },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created at',
  },
  createdBy: { type: String, optional: true, label: 'created member' },
};
