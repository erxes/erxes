import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface ISync {
  name: string;
  description: string;
  subdomain: string;
  appToken: string;
  startDate: string;
  expireDate: string;
}

export interface ISyncDocument extends ISync, Document {
  _id: string;
}

export interface ISyncedCustomers {
  syncId: string;
  customerId: string;
  syncedCustomerId: string;
}

export interface ISyncedCustomersDocument extends ISyncedCustomers, Document {
  _id: string;
}

export const syncSaasSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, label: 'Name' }),
  subdomain: field({
    type: String,
    label: 'Name',
    require: true,
    unique: true
  }),
  appToken: field({
    type: String,
    label: 'Name',
    require: true,
    unique: true
  }),
  startDate: field({ type: Date, label: 'Start Date', require: true }),
  expireDate: field({ type: Date, label: 'End Date', require: true }),
  createdAt: field({ type: Date, label: 'Created Date', default: Date.now }),
  createdUserId: field({ type: String, label: 'Created User Id' }),
  config: field({ type: Schema.Types.Mixed, label: 'config', optional: true })
});

export const syncedCustomersSaas = new Schema({
  _id: field({ pkey: true }),
  syncId: field({ type: String, label: 'Sync Id' }),
  customerId: field({ type: String, label: 'Customer Id' }),
  syncedCustomerId: field({ type: String, label: 'Customer Id' })
});
