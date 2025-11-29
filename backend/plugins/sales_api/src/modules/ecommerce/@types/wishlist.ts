import { Document } from 'mongoose';

export interface IWishlist {
  productId: string;
  customerId: string;
}

export interface IWishlistDocument extends IWishlist, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}
