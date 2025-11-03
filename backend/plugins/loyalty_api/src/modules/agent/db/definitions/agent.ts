import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { AGENT_STATUSES } from '../../constants';

export const agentSchema = schemaWrapper(
  new Schema(
    {
      _id: { pkey: true },
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
      startMonth: { type: Date, label: 'Starting month' },
      endMonth: { type: Date, label: 'Ending month' },
      startDay: { type: Date, label: 'Starting day' },
      endDay: { type: Date, label: 'Ending day' },
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
  ),
);
