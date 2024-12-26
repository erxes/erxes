import { Schema, Document } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IConfig {
  apiUrl: string;
  adminDN: string;
  adminPassword: string;
  code: string;
  localUser: string;
  userDN: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface IConfigDocument extends IConfig, Document {
  _id: string;
}

export const configSchema = schemaWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at',
      index: true,
    }),
    modifiedAt: field({
      type: Date,
      default: new Date(),
      label: 'Modified at',
    }),
    apiUrl: field({ type: String, label: 'apiUrl' }),
    localUser: field({ type: Boolean, label: 'localUser' }),
    userDN: field({ type: String, label: 'userDN' }),
    adminDN: field({ type: String, label: 'adminDN' }),
    adminPassword: field({ type: String, label: 'adminPassword' }),
    code: field({ type: String, label: 'code' }),
  })
);
