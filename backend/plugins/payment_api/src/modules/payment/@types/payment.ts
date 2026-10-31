import { Document } from 'mongoose';

export interface IPayment {
  name: string;
  kind: string;
  status: string;
  config: any;
  acceptedCurrencies: string[];
}

export interface IPaymentDocument extends IPayment, Document {
  _id: string;
}
