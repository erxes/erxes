import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

const seniorityRuleBracketSchema = new Schema(
  {
    minMonths: { type: Number, required: true, min: 0, label: 'Minimum months' },
    maxMonths: { type: Number, optional: true, min: 0, label: 'Maximum months' },
    value: { type: Number, required: true, min: 0, label: 'Value' },
  },
  { _id: false },
);

export const seniorityRuleSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      label: 'Code',
    },
    name: { type: String, required: true, label: 'Name' },
    description: { type: String, optional: true, label: 'Description' },
    valueType: {
      type: String,
      enum: ['fixed', 'percentOfBaseSalary'],
      required: true,
      label: 'Value type',
    },
    brackets: {
      type: [seniorityRuleBracketSchema],
      required: true,
      default: [],
      label: 'Brackets',
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true,
      label: 'Status',
    },
    effectiveDate: { type: Date, optional: true, label: 'Effective date' },
    expiryDate: { type: Date, optional: true, label: 'Expiry date' },
    createdAt: { type: Date, default: Date.now, label: 'Created at' },
    updatedAt: { type: Date, default: Date.now, label: 'Updated at' },
  }),
);
