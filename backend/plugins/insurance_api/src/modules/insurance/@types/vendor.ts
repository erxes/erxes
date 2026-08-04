import { Document } from 'mongoose';

export interface IDiscountTier {
  minTravelers: number;
  discountPercent: number;
}

export interface IVendorOfferedProduct {
  product: string;
  pricingOverride?: any;
  discountTiers?: IDiscountTier[];
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
