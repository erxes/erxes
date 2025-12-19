import { Schema } from 'mongoose';
import { AGENT_STATUSES } from '../../constants';

export const agentSchema = new Schema(
  {
    number: { type: String, unique: true, required: true, label: 'Number' },
    customerIds: { type: [String], label: 'Customer ids' },
    companyIds: { type: [String], label: 'Company ids' },
    status: {
      type: String,
      enum: AGENT_STATUSES.ALL,
      default: AGENT_STATUSES.DRAFT,
      label: 'Status',
    },
    startDate: { type: Date, label: 'Start date' },
    endDate: { type: Date, label: 'Ending date' },
    startMonth: { type: Number, label: 'Starting month' },
    endMonth: { type: Number, label: 'Ending month' },
    startDay: { type: Number, label: 'Starting day' },
    endDay: { type: Number, label: 'Ending day' },
    hasReturn: { type: Boolean, label: 'Whether agent returns money or not' },
    productRuleIds: { type: [String], label: 'Product specific rules' },
    // if hasReturn === true
    returnAmount: { type: Number, min: 0, label: 'Return amount' },
    // returnAmount will override returnPercent
    returnPercent: {
      type: Number,
      min: 0,
      max: 100,
      label: 'Return percent',
    },
    // if hasReturn === false
    prepaidPercent: {
      type: Number,
      min: 0,
      max: 100,
      label: 'Prepaid percent',
    },
    discountPercent: {
      type: Number,
      min: 0,
      max: 100,
      label: 'Discount percent',
    },
  },
  {
    timestamps: true,
  },
);
