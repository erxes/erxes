import { Schema } from 'mongoose';
import { field } from './utils';
import { RULE_TYPES, DISCOUNT_TYPES, PRICE_ADJUST_TYPES } from './constants';

export interface IPriceRule {
  type: string;
  value: number;
  discountType: string;
  discountValue: number;
  discountBonusProduct: string;
  priceAdjustType:
    | 'none'
    | 'default'
    | 'round'
    | 'floor'
    | 'ceil'
    | 'endsWith9';
  priceAdjustFactor: number;
}

export const priceRuleSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String, enum: RULE_TYPES.ALL }),
  value: field({ type: Number }),
  discountType: field({
    type: String,
    enum: DISCOUNT_TYPES.ALL,
    default: DISCOUNT_TYPES.DEFAULT
  }),
  discountValue: field({ type: Number }),
  discountBonusProduct: field({ type: String }),
  priceAdjustType: field({
    type: String,
    enum: PRICE_ADJUST_TYPES.ALL,
    default: PRICE_ADJUST_TYPES.NONE
  }),
  priceAdjustFactor: field({ type: Number })
});
