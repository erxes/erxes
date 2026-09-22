import { Document } from 'mongoose';

export interface ICallProCustomer {
  phoneNumber: string;
  integrationId: string;
  erxesApiId?: string;
}

export interface ICallProCustomerDocument extends ICallProCustomer, Document {
  _id: string;
}
