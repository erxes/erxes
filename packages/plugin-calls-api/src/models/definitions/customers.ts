import { Schema, Document, HydratedDocument } from 'mongoose';
import { field } from './utils';
import { ICustomerModel } from '../Customers';

export interface ICustomer {
  _id: string;
  inboxIntegrationId: string;
  primaryPhone: string | number;
  erxesApiId?: string;
  status: string;
}

export type ICustomerDocument = HydratedDocument<ICustomer>;

export const customerSchema: Schema<ICustomer, ICustomerModel> = new Schema<ICustomer, ICustomerModel>({
  _id: field({ pkey: true }),
  erxesApiId: { type: String, label: 'Customer id at contacts-api' },
  primaryPhone: {
    type: String,
    unique: true,
    label: 'Call primary phone',
  },
  inboxIntegrationId: { type: String, label: 'Inbox integration id' },
  status: { type: String, label: 'status' },
});
