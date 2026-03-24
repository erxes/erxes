import { Document } from 'mongoose';

export interface IPricing {
  name?: string;
}

export interface IPricingDocument extends IPricing, Document {
  createdAt: Date;
  updatedAt: Date;
}
