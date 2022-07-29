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
  productId: field({ type: String, label: 'ProductId' }),
  customerId: field({ type: String, label: 'CustomerId' }),
  review: field({ type: Number, label: 'Review' })
});
