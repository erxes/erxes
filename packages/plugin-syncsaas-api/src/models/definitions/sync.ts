import { Document, Schema } from 'mongoose';
import { field } from './utils';
import { CUSTOMER_STATUSES } from '../../common/constants';

export interface ISync {
  name: string;
  description: string;
  categoryId: string;
  subdomain: string;
  appToken: string;
  startDate: string;
  expireDate: string;
}

export interface ICategory {
  name: string;
  parentId: string;
  description: string;
  code: string;
  order: string;
}

export interface ISyncDocument extends ISync, Document {
  _id: string;
}

export interface ISyncedCustomers {
  syncId: string;
  customerId: string;
  syncedCustomerId: string;
  createdAt: string;
}

export interface ISyncedCustomersDocument extends ISyncedCustomers, Document {
  _id: string;
}

export interface ICategoryDocument extends ICategory, Document {
  _id: string;
}

export const syncSaasCategories = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  parentId: field({ typ: String }),
  description: field({ type: String, label: 'Description' }),
  code: field({ type: String, label: 'Code' }),
  order: field({ type: String, label: 'Order' })
});

export const syncSaasSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, label: 'Name' }),
  categoryId: field({ type: String, label: 'CategoryId' }),
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
  syncedCustomerId: field({ type: String, label: 'Customer Id' }),
  status: field({
    type: String,
    label: 'status',
    enum: CUSTOMER_STATUSES.ALL,
    optional: true
  }),
  createdAt: field({
    type: Date,
    label: 'Created Date',
    default: Date.now
  })
});
