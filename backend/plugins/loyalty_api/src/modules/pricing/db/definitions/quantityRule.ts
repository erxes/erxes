import { Schema } from 'mongoose';
import { RULE_TYPES, DISCOUNT_TYPES, PRICE_ADJUST_TYPES } from './constants';
import { IQuantityRule } from '@/pricing/@types/quantityRule';

export const quantityRuleSchema = new Schema<IQuantityRule>({
  type: { type: String, enum: RULE_TYPES.ALL, required: true },
  value: { type: Number, required: true },
  discountType: {
    type: String,
    enum: DISCOUNT_TYPES.ALL,
    default: DISCOUNT_TYPES.DEFAULT as typeof DISCOUNT_TYPES.ALL[number]
  },
  discountValue: { type: Number, default: 0 },
  discountBonusProduct: { type: String },
  priceAdjustType: {
    type: String,
    enum: PRICE_ADJUST_TYPES.ALL,
    default: PRICE_ADJUST_TYPES.NONE as typeof PRICE_ADJUST_TYPES.ALL[number]
  },
  priceAdjustFactor: { type: Number, default: 0 }
}, {
  timestamps: false
});
