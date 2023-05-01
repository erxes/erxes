import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface IProductreview {
  productId: string;
  customerId: string;
  review: number;
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
  createdAt: field({ type: Date, label: 'Created Date' }),
  modifiedAt: field({ type: Date, label: 'Modified Date' })
});
