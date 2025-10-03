import { Document } from 'mongoose';

export interface IOrder {
  _id: string;
  customerId: string;
  tourId: string;
  amount: number;
  status: string;
  note: string;
  branchId?: string;
  numberOfPeople: number;
  type?: string;
  additionalCustomers?: string[];
  invoices?: { amount: number; _id: string }[];
}

export interface IOrderDocument extends IOrder, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}
