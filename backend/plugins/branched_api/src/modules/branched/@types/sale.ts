import { Document } from 'mongoose';

export interface ISale {
  amount: number;
  date: Date;
  branchId: string;
  productId: string;
  quantity: number;
  customerId?: string;
  description?: string;
  paymentType?: string;
  status?: string;
  discount?: number;
  tax?: number;
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface ISaleDocument extends ISale, Document {
  _id: string;
}
