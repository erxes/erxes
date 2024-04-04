import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface ILastViewedItem {
  productId: string;
  customerId: string;
}

export interface ILastViewedItemDocument extends ILastViewedItem, Document {
  _id: string;
  modifiedAt: Date;
}

export const lastvieweditemSchema = new Schema({
  _id: field({ pkey: true }),
  productId: field({ type: String, label: 'ProductId', index: true }),
  customerId: field({ type: String, label: 'CustomerId', index: true }),
  modifiedAt: field({ type: Date, label: 'Date' })
});

lastvieweditemSchema.index({ customerId: 1, productId: 1 });
