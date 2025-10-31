import { Document, Schema } from 'mongoose';
import { field } from './utils';
import { AGENT_STATUSES } from '~/modules/loyalty/@types/constants';

// With label fields defined, the label will be shown in system logs
export const agentSchema = new Schema({
  _id: field({ pkey: true }),
  number: field({
    type: String,
    unique: true,
    required: true,
    label: 'Number',
  }),
  customerIds: field({ type: [String], label: 'Customer ids' }),
  companyIds: field({ type: [String], label: 'Company ids' }),
  status: field({
    type: String,
    enum: AGENT_STATUSES.ALL,
    default: AGENT_STATUSES.DRAFT,
    label: 'Status',
  }),
  startDate: field({ type: Date, label: 'Start date' }),
  endDate: field({ type: Date, label: 'Ending date' }),
  startMonth: field({ type: Date, label: 'Starting month' }),
  endMonth: field({ type: Date, label: 'Ending month' }),
  startDay: field({ type: Date, label: 'Starting day' }),
  endDay: field({ type: Date, label: 'Ending day' }),
  hasReturn: field({
    type: Boolean,
    label: 'Whether agent returns money or not',
  }),
  productRuleIds: field({ type: [String], label: 'Product specific rules' }),
  // if hasReturn === true
  returnAmount: field({ type: Number, min: 0, label: 'Return amount' }),
  // returnAmount will override returnPercent
  returnPercent: field({
    type: Number,
    min: 0,
    max: 100,
    label: 'Return percent',
  }),
  // if hasReturn === false
  prepaidPercent: field({
    type: Number,
    min: 0,
    max: 100,
    label: 'Prepaid percent',
  }),
  discountPercent: field({
    type: Number,
    min: 0,
    max: 100,
    label: 'Discount percent',
  }),
});

// TODO: add indexes on other fields later depending on usage
agentSchema.index({ number: 1 });
