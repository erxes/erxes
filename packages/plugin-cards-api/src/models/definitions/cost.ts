import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface ICost {
  _id?: string;
  name: string;
  code: string;
}

export interface ICostDocument extends ICost, Document {
  _id: string;
  status: string;
  createdBy: string;
  createdAt: Date;
}
export const costSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  code: field({ type: String, label: 'code' }),
  status: field({ type: String, label: 'Status' }),
  createdBy: field({ type: String, label: 'Created by' }),
  createdAt: field({ type: Date, label: 'Created at' })
});
