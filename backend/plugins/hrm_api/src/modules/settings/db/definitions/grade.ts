import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const gradeSchema = schemaWrapper(
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
    rank: { type: Number, optional: true, index: true, label: 'Rank' },
    baseSalary: { type: Number, optional: true, min: 0, label: 'Base salary' },
    allowanceAmount: {
      type: Number,
      optional: true,
      min: 0,
      label: 'Allowance amount',
    },
    allowanceRate: {
      type: Number,
      optional: true,
      min: 0,
      label: 'Allowance rate',
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true,
      label: 'Status',
    },
    createdAt: { type: Date, default: Date.now, label: 'Created at' },
    updatedAt: { type: Date, default: Date.now, label: 'Updated at' },
  }),
);
