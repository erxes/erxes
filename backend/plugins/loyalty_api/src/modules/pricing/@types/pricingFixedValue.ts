import { Document } from 'mongoose';

export interface IPricingConditionPrice {
  conditionId: string;
  price: number;
}

export interface IPricingFixedValue {
  pricingPlanId?: string;
  productId?: string;
  sortField?: string;
  uom?: string;
  unitPrice?: number;
  newPrice?: number;
  conditionPrices?: IPricingConditionPrice[];
  createdBy?: string;
  updatedBy?: string;
}
export interface IPricingFixedValueDocument
  extends IPricingFixedValue,
    Document {
  _id: string;
}
