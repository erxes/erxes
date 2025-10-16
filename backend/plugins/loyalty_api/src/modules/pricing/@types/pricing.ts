import { Document } from 'mongoose';

export interface IPricing {
  name?: string;
}

export interface IPricingDocument extends IPricing, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
