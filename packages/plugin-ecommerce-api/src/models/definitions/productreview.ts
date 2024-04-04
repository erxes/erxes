import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface IProductreview {
  productId: string;
  customerId: string;
  review: number;
  description: string;
  info: any;
}

export interface IProductreviewDocument extends IProductreview, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export const productreviewSchema = new Schema({
  _id: field({ pkey: true }),
  productId: field({ type: String, label: 'Product' }),
  customerId: field({ type: String, label: 'Customer' }),
  review: field({ type: Number, label: 'Review' }),
  description: field({ type: String, label: 'Description' }),
  info: field({ type: Object, label: 'Info' }),
  createdAt: field({ type: Date, label: 'Created Date' }),
  modifiedAt: field({ type: Date, label: 'Modified Date' }),
});
