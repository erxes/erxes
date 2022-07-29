import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface IWishlist {
  productId: string;
  customerId: string;
}

export interface IWishlistDocument extends IWishlist, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export const wishlistSchema = new Schema({
  _id: field({ pkey: true }),
  productId: field({ type: String, label: 'ProductId' }),
  customerId: field({ type: String, label: 'CustomerId' })
});
