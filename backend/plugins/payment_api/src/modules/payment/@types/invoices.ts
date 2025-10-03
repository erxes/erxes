import { Document } from 'mongoose';


export interface IInvoice {
  invoiceNumber: string;
  amount: number;
  currency: string;
  phone: string;
  email: string;
  description?: string;
  status: string;
  customerType: string;
  customerId: string;
  contentType: string;
  contentTypeId: string;
  createdAt: Date;
  resolvedAt?: Date;
  redirectUri?: string;
  paymentIds: string[];
  callback?: string;
  warningText?: string;
  data?: any;
}
export interface IInvoiceDocument extends IInvoice, Document {
  _id: string;
}

