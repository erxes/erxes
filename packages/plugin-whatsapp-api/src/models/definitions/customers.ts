import { Document, Schema } from 'mongoose';

import { field } from './utils';

export interface ICustomer {
  userId: string;
  erxesApiId?: string;
  firstName: string;
  lastName: string;
  profilePic: string;
  integrationId: string;
  phoneNumber: string;
}

export interface ICustomerDocument extends ICustomer, Document {
  _id: string;
}

export const customerSchema = new Schema({
  _id: field({ pkey: true }),
  userId: { type: String, unique: true, label: 'Instagram user id' },
  erxesApiId: { type: String, label: 'Customer id at contacts-api' },
  firstName: String,
  lastName: String,
  profilePic: String,
  integrationId: { type: String, label: 'Inbox integration id' },
  phoneNumber: String
});
