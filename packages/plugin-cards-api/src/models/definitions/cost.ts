import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface ICost {
  name: string;
  code: string;
}

export interface ICostDocument extends ICost, Document {
  _id: string;
  createdAt: Date;
}
export const costSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  code: field({ type: String, label: 'code' })
});
