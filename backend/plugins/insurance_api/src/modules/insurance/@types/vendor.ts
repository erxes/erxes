import { Document } from 'mongoose';

export interface IVendorOfferedProduct {
  product: string;
  pricingOverride?: any;
}

export interface IVendor {
  name: string;
  offeredProducts: IVendorOfferedProduct[];
}

export interface IVendorDocument extends IVendor, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
