import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface IDynamic {
  _id: string;
  endPoint: string;
  username: string;
  password: string;
  createdAt: Date;
}

export interface IDynamicDocument extends IDynamic, Document {
  _id: string;
}

export const msdynamicSchema = new Schema({
  _id: field({ pkey: true }),
  endPoint: field({
    type: String,
    label: 'EndPoint URL',
    optional: true
  }),
  username: field({
    type: String,
    label: 'Auth User Name',
    optional: true
  }),
  password: field({
    type: String,
    label: 'Auth Password',
    optional: true
  }),
  createdAt: field({
    type: Date,
    default: Date.now,
    label: 'Created at'
  })
});
