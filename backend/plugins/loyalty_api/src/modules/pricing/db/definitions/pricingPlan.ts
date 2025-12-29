import { Schema } from 'mongoose';
import {
  STATUS_TYPES,
  DISCOUNT_TYPES,
  APPLY_TYPES,
  PRICE_ADJUST_TYPES
} from './constants';
import { priceRuleSchema } from './priceRule';
import { quantityRuleSchema } from './quantityRule';
import { expiryRuleSchema } from './expiryRule';
import { repeatRuleSchema } from './repeatRule';

export const pricingPlanSchema = new Schema({
  // Generals
  name: { type: String },
  status: { type: String, enum: STATUS_TYPES.ALL, default: STATUS_TYPES.ACTIVE },
  type: { type: String, enum: DISCOUNT_TYPES.ALL, default: DISCOUNT_TYPES.FIXED },
  value: { type: Number },
  priceAdjustType: { type: String, enum: PRICE_ADJUST_TYPES.ALL, default: PRICE_ADJUST_TYPES.NONE },
  priceAdjustFactor: { type: Number },
  bonusProduct: { type: String },
  isPriority: { type: Boolean, default: false },

  applyType: { type: String, enum: APPLY_TYPES.ALL, default: APPLY_TYPES.PRODUCT },

  products: { type: [String], default: [] },
  productsExcluded: { type: [String], default: [] },
  productsBundle: { type: [[String]], default: [] },
  categories: { type: [String], default: [] },
  categoriesExcluded: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  tagsExcluded: { type: [String], default: [] },
  segments: { type: [String], default: [] },
  vendors: { type: [String], default: [] },

  isStartDateEnabled: { type: Boolean, default: false },
  isEndDateEnabled: { type: Boolean, default: false },
  startDate: { type: Date },
  endDate: { type: Date },

  // Locations
  departmentIds: { type: [String], default: [] },
  branchIds: { type: [String], default: [] },
  boardId: { type: String },
  pipelineId: { type: String },
  stageId: { type: String },

  // Rules
  isPriceEnabled: { type: Boolean, default: false },
  priceRules: { type: [priceRuleSchema], default: [] },

  isQuantityEnabled: { type: Boolean, default: false },
  quantityRules: { type: [quantityRuleSchema], default: [] },

  isExpiryEnabled: { type: Boolean, default: false },
  expiryRules: { type: [expiryRuleSchema], default: [] },

  isRepeatEnabled: { type: Boolean, default: false },
  repeatRules: { type: [repeatRuleSchema], default: [] },

  // Timestamps
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});
