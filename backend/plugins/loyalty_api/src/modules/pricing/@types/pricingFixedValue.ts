import { Document } from 'mongoose';

export interface IPricingFixedValue {
  pricingPlanId?: string;
  productId?: string;
  sortField?: string;
  uom?: string;
  unitPrice?: number;
  newPrice?: number;
  createdBy?: string;
  updatedBy?: string;
}
export interface IPricingFixedValueDocument
  extends IPricingFixedValue,
    Document {
  _id: string;
}
