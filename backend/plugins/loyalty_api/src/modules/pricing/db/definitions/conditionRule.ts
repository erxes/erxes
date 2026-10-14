import { Schema } from 'mongoose';
import { PRICE_ADJUST_TYPES, RULE_DISCOUNT_TYPES } from './constants';
import { IPricingConditionRule } from '@/pricing/@types/pricingPlan';

// Shaped like the quantity rule, keyed by a product condition code instead.
export const conditionRuleSchema = new Schema<IPricingConditionRule>(
  {
    conditionCode: { type: String, required: true },
    discountType: {
      type: String,
      enum: RULE_DISCOUNT_TYPES.ALL,
      default:
        RULE_DISCOUNT_TYPES.DEFAULT as (typeof RULE_DISCOUNT_TYPES.ALL)[number],
    },
    discountValue: { type: Number, default: 0 },
    discountBonusProduct: { type: String },
    priceAdjustType: {
      type: String,
      enum: PRICE_ADJUST_TYPES.ALL,
      default:
        PRICE_ADJUST_TYPES.NONE as (typeof PRICE_ADJUST_TYPES.ALL)[number],
    },
    priceAdjustFactor: { type: Number, default: 0 },
  },
  { _id: false },
);
