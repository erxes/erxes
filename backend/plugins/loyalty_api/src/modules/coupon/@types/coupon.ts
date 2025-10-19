import { Document } from 'mongoose';

export interface ICoupon {
  name?: string;
}

export interface ICouponDocument extends ICoupon, Document {
  createdAt: Date;
  updatedAt: Date;
}
