import { Document } from 'mongoose';

export interface IPriceRule {
  type: string;
  value: number;
  discountType: string;
  discountValue: number;
  discountBonusProduct?: string;
  priceAdjustType:
    | 'none'
    | 'default'
    | 'round'
    | 'floor'
    | 'ceil'
    | 'endsWith9';
  priceAdjustFactor: number;
}

export interface IPriceRuleDocument extends IPriceRule, Document {
  createdAt: Date;
  updatedAt: Date;
}
