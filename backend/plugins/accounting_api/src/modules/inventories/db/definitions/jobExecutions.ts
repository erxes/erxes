import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

const item = new Schema(
  {
    productId: { type: String, required: true },
    uom: String,
    quantity: { type: Number, required: true, min: 0 },
    costRatio: { type: Number, min: 0 },
  },
  { _id: false },
);
const cost = new Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    accountId: { type: String, required: true },
  },
  { _id: false },
);

const executionItem = new Schema(
  {
    _id: { type: String, required: true },
    jobId: { type: String, required: true },
    jobName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    inputs: { type: [item], default: [] },
    outputs: { type: [item], default: [] },
    laborCosts: { type: [cost], default: [] },
    overheadCosts: { type: [cost], default: [] },
  },
  { _id: false },
);

export const jobExecutionSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    date: { type: Date, required: true },
    jobs: { type: [executionItem], required: true },
    description: String,
    inputAccountId: { type: String, required: true },
    inputBranchId: String,
    inputDepartmentId: String,
    outputAccountId: { type: String, required: true },
    outputBranchId: String,
    outputDepartmentId: String,
    status: {
      type: String,
      enum: ['draft', 'posting', 'posted', 'undoing', 'error'],
      default: 'draft',
    },
    parentId: String,
    ptrId: String,
    error: String,
    createdAt: { type: Date, default: Date.now },
    createdBy: String,
    modifiedAt: { type: Date, default: Date.now },
    modifiedBy: String,
  }),
);
jobExecutionSchema.index({ date: -1, _id: 1 });
