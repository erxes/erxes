import { Document, Schema } from 'mongoose';
import { field } from './utils';
import { STATUS_TYPES, DISCOUNT_TYPES, APPLY_TYPES } from './constants';
import {
  IQuantity,
  IPrice,
  IExpiry,
  IRepeat,
  quantitySchema,
  priceSchema,
  expirySchema,
  repeatSchema
} from './rules';

export interface IDiscount {
  name: string;
  status: string;
  type: string;
  value: number;
  bonusProduct?: string;

  applyType: string;

  products: string[];
  productsExcluded: string[];
  categories: string[];
  categoriesExcluded: string[];

  isStartDateEnabled?: boolean;
  isEndDateEnabled?: boolean;

  startDate?: Date;
  endDate?: Date;

  departmentIds?: string[];
  branchIds?: string[];
  boardId?: string;
  pipelineId?: string;
  stageId?: string;

  isQuantityEnabled?: boolean;
  quantityRules?: IQuantity[];

  isPriceEnabled?: boolean;
  priceRules?: IPrice[];

  isExpiryEnabled?: boolean;
  expiryRules?: IExpiry[];

  isRepeatEnabled?: boolean;
  repeatRules?: IRepeat[];

  createdBy?: string;
  updatedBy?: string;
}

export interface IDiscountDocument extends IDiscount, Document {
  _id: string;
}

export const discountSchema = new Schema({
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
  bonusProduct: field({
    type: String,
    label: 'Bonus Product'
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
  categories: field({
    type: [String],
    label: 'Product Categories'
  }),
  categoriesExcluded: field({
    type: [String],
    label: 'Excluded Categories'
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
  isQuantityEnabled: field({
    type: Boolean,
    label: 'Quantity Enabled'
  }),
  quantityRules: field({
    type: [quantitySchema],
    label: 'Quantity Rules'
  }),

  isPriceEnabled: field({
    type: Boolean,
    label: 'Price Enabled'
  }),
  priceRules: field({
    type: [priceSchema],
    label: 'Price Rules'
  }),

  isExpiryEnabled: field({
    type: Boolean,
    label: 'Expiry Enabled'
  }),
  expiryRules: field({
    type: [expirySchema],
    label: 'Expiry Rules'
  }),

  isRepeatEnabled: field({
    type: Boolean,
    label: 'Repeat Enabled'
  }),
  repeatRules: field({
    type: [repeatSchema],
    label: 'Repeat Rules'
  }),

  // Timestamps
  createdAt: field({ type: Date, default: new Date(), label: 'Created At' }),
  createdBy: field({ type: String, label: 'Created By' }),
  updatedAt: field({ type: Date, default: new Date(), label: 'Updated At' }),
  updatedBy: field({ type: String, label: 'Updated By' })
});
