import { Document } from 'mongoose';

export interface ILastViewedItem {
  productId: string;
  customerId: string;
}

export interface ILastViewedItemDocument extends ILastViewedItem, Document {
  _id: string;
  modifiedAt: Date;
}
