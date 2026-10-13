import { LOYALTY_ACCOUNT_TYPE_STATUSES } from '@/score/constants';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

const loyaltyTierSchema = new Schema(
  {
    key: { type: String, required: true, label: 'Key' },
    name: { type: String, required: true, label: 'Name' },
    order: { type: Number, required: true, label: 'Order' },
    deprecated: { type: Boolean, label: 'Deprecated' },
  },
  { _id: false },
);

const loyaltyAccountTypeResetSchema = new Schema(
  {
    period: {
      type: String,
      enum: ['never', 'monthly', 'yearly'],
      default: 'never',
      label: 'Reset period',
    },
    tierTo: {
      type: String,
      enum: ['keep', 'none', 'lowest'],
      default: 'keep',
      label: 'Tier after a reset',
    },
    since: { type: Date, label: 'Reset effective since' },
    lastBoundary: { type: Date, label: 'Last reset period start' },
  },
  { _id: false },
);

const loyaltyAccountTypeExpirySchema = new Schema(
  {
    mode: {
      type: String,
      enum: ['none', 'calendar', 'rolling'],
      default: 'none',
      label: 'Expiry mode',
    },
    months: { type: Number, min: 1, label: 'Months until expiry' },
  },
  { _id: false },
);

const loyaltyEarnEligibilitySchema = new Schema(
  {
    who: {
      type: String,
      enum: ['all', 'clientPortal', 'segment'],
      default: 'all',
      label: 'Who may earn',
    },
    segmentId: { type: String, label: 'Segment that may earn' },
  },
  { _id: false },
);

export const loyaltyAccountTypeSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, required: true, label: 'Name' },
    ownerType: {
      type: String,
      enum: ['customer', 'company', 'user', 'cpUser'],
      required: true,
      label: 'Owner type',
    },
    frozenBlocks: {
      type: String,
      enum: ['spending', 'all'],
      default: 'spending',
      label: 'Blocked while the account is frozen',
    },
    // Lowest first; a tier's key is what the owner record and accounts hold.
    tiers: { type: [loyaltyTierSchema], default: [], label: 'Tiers' },
    reset: { type: loyaltyAccountTypeResetSchema, label: 'Reset' },
    expiry: { type: loyaltyAccountTypeExpirySchema, label: 'Point expiry' },
    pendingDays: { type: Number, min: 0, default: 0, label: 'Pending days' },
    currencyRatio: {
      type: Number,
      min: 0,
      default: 1,
      label: 'Money per earned point',
    },
    pointValue: {
      type: Number,
      min: 0,
      default: 1,
      label: 'Money a point pays',
    },
    earnEligibility: {
      type: loyaltyEarnEligibilitySchema,
      label: 'Who may earn',
    },
    // Featured field on the owner record that mirrors the ledger balance.
    fieldId: { type: String, label: 'Balance field' },
    tierFieldId: { type: String, label: 'Tier field' },
    status: {
      type: String,
      enum: Object.values(LOYALTY_ACCOUNT_TYPE_STATUSES),
      default: LOYALTY_ACCOUNT_TYPE_STATUSES.ACTIVE,
      index: true,
      label: 'Status',
    },
    createdUserId: { type: String, label: 'Created by' },
  },
  { timestamps: true },
);
