import { Document } from 'mongoose';

export interface ITransaction {
  invoiceId: string;
  code: string;
  paymentId: string;
  paymentKind: string;
  amount: number;
  status: string;
  description?: string;
  details?: any;
  // response from selected payment method
  response: any;
}
export interface ITransactionDocument extends ITransaction, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
