import { Document } from 'mongoose';

export interface IExpiryRule {
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

export interface IExpiryRuleDocument extends IExpiryRule, Document {
  createdAt: Date;
  updatedAt: Date;
}
