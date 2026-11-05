import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

const jobItemSchema = new Schema(
  {
    productId: { type: String, required: true, label: 'Product' },
    uom: { type: String, optional: true, label: 'Unit of measure' },
    quantity: { type: Number, required: true, min: 0, label: 'Quantity' },
    costRatio: { type: Number, optional: true, min: 0, label: 'Cost ratio' },
  },
  { _id: false },
);

const jobCostSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, label: 'Name' },
    amount: { type: Number, required: true, min: 0, label: 'Amount' },
    accountId: { type: String, required: true, label: 'Posting account' },
  },
  { _id: false },
);

export const jobSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    code: { type: String, optional: true, label: 'Code' },
    name: { type: String, required: true, label: 'Name' },
    description: { type: String, optional: true, label: 'Description' },
    duration: { type: Number, optional: true, min: 0, label: 'Duration' },
    durationType: { type: String, optional: true, label: 'Duration type' },
    laborCosts: {
      type: [jobCostSchema],
      default: [],
      label: 'Labor costs',
    },
    overheadCosts: {
      type: [jobCostSchema],
      default: [],
      label: 'Overhead costs',
    },
    inputs: { type: [jobItemSchema], default: [], label: 'Input items' },
    outputs: { type: [jobItemSchema], default: [], label: 'Output items' },
    status: { type: String, default: 'active', label: 'Status' },
    createdAt: { type: Date, default: new Date(), label: 'Created date' },
    createdBy: { type: String, label: 'Created User' },
    modifiedAt: { type: Date, default: new Date(), label: 'Modified date' },
    modifiedBy: { type: String, label: 'Modified User' },
  }),
);

jobSchema.index({ name: 1 });
jobSchema.index({ code: 1 });
jobSchema.index({ 'outputs.productId': 1 });
