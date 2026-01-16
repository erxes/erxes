import { Document } from 'mongoose';

export interface IQuantityRule {
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

export interface IQuantityRuleDocument extends IQuantityRule, Document {
  createdAt: Date;
  updatedAt: Date;
}
