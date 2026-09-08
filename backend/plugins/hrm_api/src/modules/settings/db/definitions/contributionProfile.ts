import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

const contributionComponentSchema = new Schema(
  {
    code: { type: String, required: true, label: 'Code' },
    name: { type: String, required: true, label: 'Name' },
    side: {
      type: String,
      enum: ['employee', 'employer'],
      required: true,
      label: 'Side',
    },
    rate: { type: Number, required: true, min: 0, label: 'Rate' },
    accountId: { type: String, optional: true, label: 'Account' },
    reportCode: { type: String, optional: true, label: 'Report code' },
  },
  { _id: false },
);

export const contributionProfileSchema = schemaWrapper(
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
    employeeRate: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      label: 'Employee rate',
    },
    employerRate: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      label: 'Employer rate',
    },
    employeeCap: { type: Number, optional: true, min: 0, label: 'Employee cap' },
    employerCap: { type: Number, optional: true, min: 0, label: 'Employer cap' },
    minBase: { type: Number, optional: true, min: 0, label: 'Minimum base' },
    maxBase: { type: Number, optional: true, min: 0, label: 'Maximum base' },
    components: {
      type: [contributionComponentSchema],
      default: [],
      label: 'Components',
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
