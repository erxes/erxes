import { Schema } from 'mongoose';
import { IExpiryRule } from '@/pricing/@types/expiryRule'
import { EXPIRY_TYPES, DISCOUNT_TYPES, PRICE_ADJUST_TYPES } from './constants';

export const expiryRuleSchema = new Schema<IExpiryRule>({
  type: { type: String, enum: EXPIRY_TYPES.ALL, required: true },
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
