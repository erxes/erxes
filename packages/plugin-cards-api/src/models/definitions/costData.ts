import { Document, Schema } from 'mongoose';
import { field, schemaWrapper } from './utils';

export interface ICostData {
  name: string;
  price: string;
}

export interface ICostDataDocument extends ICostData, Document {
  _id: string;
  createdAt: Date;
}

export const costDataSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name' }),
  price: field({ type: String, label: 'Price' })
});
