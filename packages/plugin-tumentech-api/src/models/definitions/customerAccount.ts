import { Document, Schema } from 'mongoose';

import { field, schemaHooksWrapper } from './utils';

export interface ICustomerAccount {
  customerId: string;
  balance: number;
}

export interface IPurchase {
  driverId: string;
  carId: string;
  amount: number;
}

export interface ICustomerAccountDocument extends ICustomerAccount, Document {
  _id: string;
  purchases: IPurchase[];
}

export const purchaseSchema = new Schema(
  {
    driverId: { type: String },
    carId: { type: String },
    amount: { type: Number }
  },
  { _id: false }
);
export const customerAccountSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    customerId: field({ type: String, label: 'Customer Id', required: true }),
    balance: field({ type: Number, label: 'Amount', required: true }),
    purchases: field({ type: [purchaseSchema], default: [] })
  }),
  'cutomer_accounts'
);

customerAccountSchema.index({ customerId: 1 });
