import { Schema, Document } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface IConfig {
  apiUrl: string;
  adminDN: string;
  adminPassword: string;
  code: string;
  useDN: boolean;
  baseDN: string;
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
    apiUrl: field({ type: String, optional: true, label: 'apiUrl' }),
    useDN: field({ type: Boolean, label: 'use Distinguished Name' }),
    baseDN: field({ type: String, optional: true, label: 'baseDN' }),
    adminDN: field({ type: String, optional: true, label: 'adminDN' }),
    adminPassword: field({
      type: String,
      optional: true,
      label: 'adminPassword',
    }),
    code: field({ type: String, label: 'code' }),
  })
);
