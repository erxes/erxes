import { Document, Schema } from 'mongoose';
import { field } from './utils';
import {
  STATUS_TYPES,
  DISCOUNT_TYPES,
  APPLY_TYPES,
  PRICE_ADJUST_TYPES
} from './constants';
import { IPriceRule, priceRuleSchema } from './priceRule';
import { IQuantityRule, quantityRuleSchema } from './quantityRule';
import { IExpiryRule, expiryRuleSchema } from './expiryRule';
import { IRepeatRule, repeatRuleSchema } from './repeatRule';

export interface IPricingPlan {
  name: string;
  status: string;
  type: string;
  value: number;
  priceAdjustType: 'none' | 'round' | 'floor' | 'ceil' | 'endsWith9';
  priceAdjustFactor: number;
  bonusProduct?: string;
  isPriority: boolean;

  applyType: string;

  products: string[];
  productsExcluded: string[];
  productsBundle: string[];
  categories: string[];
  categoriesExcluded: string[];
  segments: string[];

  isStartDateEnabled?: boolean;
  isEndDateEnabled?: boolean;

  startDate?: Date;
  endDate?: Date;

  departmentIds?: string[];
  branchIds?: string[];
  boardId?: string;
  pipelineId?: string;
  stageId?: string;

  isPriceEnabled?: boolean;
  priceRules?: IPriceRule[];

  isQuantityEnabled?: boolean;
  quantityRules?: IQuantityRule[];

  isExpiryEnabled?: boolean;
  expiryRules?: IExpiryRule[];

  isRepeatEnabled?: boolean;
  repeatRules?: IRepeatRule[];

  createdBy?: string;
  updatedBy?: string;
}

export interface IPricingPlanDocument extends IPricingPlan, Document {
  _id: string;
}

export const pricingPlanSchema = new Schema({
  _id: field({ pkey: true }),

  // Generals
  name: field({
    type: String,
    label: 'Name'
  }),
  status: field({
    type: String,
    enum: STATUS_TYPES.ALL,
    default: STATUS_TYPES.ACTIVE,
    label: 'Status'
  }),
  type: field({
    type: String,
    enum: DISCOUNT_TYPES.ALL,
    default: DISCOUNT_TYPES.FIXED,
    label: 'Amount Type'
  }),
  value: field({
    type: Number,
    label: 'Amount Value'
  }),
  priceAdjustType: field({
    type: String,
    enum: PRICE_ADJUST_TYPES.ALL,
    default: PRICE_ADJUST_TYPES.NONE,
    label: 'Price Adjust Type'
  }),
  priceAdjustFactor: field({
    type: Number,
    label: 'Price Adjust Position'
  }),
  bonusProduct: field({
    type: String,
    label: 'Bonus Product'
  }),
  isPriority: field({
    type: Boolean,
    label: 'Is Priority',
    default: false
  }),

  applyType: field({
    type: String,
    enum: APPLY_TYPES.ALL,
    default: APPLY_TYPES.PRODUCT,
    label: 'Apply Type'
  }),

  products: field({
    type: [String],
    label: 'Products'
  }),
  productsExcluded: field({
    type: [String],
    label: 'Excluded Products'
  }),
  productsBundle: field({
    type: [String],
    label: 'Bundle Products'
  }),
  categories: field({
    type: [String],
    label: 'Product Categories'
  }),
  categoriesExcluded: field({
    type: [String],
    label: 'Excluded Categories'
  }),
  segments: field({
    type: [String],
    label: 'Segment'
  }),

  isStartDateEnabled: field({
    type: Boolean,
    default: false,
    label: 'Start Date Enabled'
  }),
  isEndDateEnabled: field({
    type: Boolean,
    default: false,
    label: 'End Date Enabled'
  }),

  startDate: field({
    type: Date,
    label: 'Start Date'
  }),
  endDate: field({
    type: Date,
    label: 'End Date'
  }),

  // Locations
  departmentIds: field({
    type: [String],
    label: 'Department Ids'
  }),
  branchIds: field({
    type: [String],
    label: 'Branch Ids'
  }),
  boardId: field({
    type: String,
    label: 'Board Id'
  }),
  pipelineId: field({
    type: String,
    label: 'Pipeline Id'
  }),
  stageId: field({
    type: String,
    label: 'Stage Id'
  }),

  // Rules
  isPriceEnabled: field({
    type: Boolean,
    label: 'Price Enabled'
  }),
  priceRules: field({
    type: [priceRuleSchema],
    label: 'Price Rules'
  }),

  isQuantityEnabled: field({
    type: Boolean,
    label: 'Quantity Enabled'
  }),
  quantityRules: field({
    type: [quantityRuleSchema],
    label: 'Quantity Rules'
  }),

  isExpiryEnabled: field({
    type: Boolean,
    label: 'Expiry Enabled'
  }),
  expiryRules: field({
    type: [expiryRuleSchema],
    label: 'Expiry Rules'
  }),

  isRepeatEnabled: field({
    type: Boolean,
    label: 'Repeat Enabled'
  }),
  repeatRules: field({
    type: [repeatRuleSchema],
    label: 'Repeat Rules'
  }),

  // Timestamps
  createdAt: field({ type: Date, default: new Date(), label: 'Created At' }),
  createdBy: field({ type: String, label: 'Created By' }),
  updatedAt: field({ type: Date, default: new Date(), label: 'Updated At' }),
  updatedBy: field({ type: String, label: 'Updated By' })
});
