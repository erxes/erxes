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

export const syncedSaasSchema = new Schema({
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
  createdUserId: field({ type: String, label: 'Created User Id' })
});
