import { Schema } from 'mongoose';
import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

const techCardItemSchema = new Schema(
  {
    productId: { type: String, required: true, label: 'Product' },
    uom: { type: String, optional: true, label: 'Unit of measure' },
    quantity: { type: Number, required: true, min: 0, label: 'Quantity' },
    costRatio: { type: Number, optional: true, min: 0, label: 'Cost ratio' },
  },
  { _id: false },
);

const techCardCostSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, label: 'Name' },
    amount: { type: Number, required: true, min: 0, label: 'Amount' },
    accountId: { type: String, required: true, label: 'Posting account' },
  },
  { _id: false },
);

export const techCardSchema = schemaWrapper(
  new Schema({
    _id: mongooseStringRandomId,
    code: { type: String, optional: true, label: 'Code' },
    name: { type: String, required: true, label: 'Name' },
    description: { type: String, optional: true, label: 'Description' },
    duration: { type: Number, optional: true, min: 0, label: 'Duration' },
    durationType: { type: String, optional: true, label: 'Duration type' },
    laborCosts: {
      type: [techCardCostSchema],
      default: [],
      label: 'Labor costs',
    },
    overheadCosts: {
      type: [techCardCostSchema],
      default: [],
      label: 'Overhead costs',
    },
    inputs: { type: [techCardItemSchema], default: [], label: 'Input items' },
    outputs: { type: [techCardItemSchema], default: [], label: 'Output items' },
    status: { type: String, default: 'active', label: 'Status' },
    createdAt: { type: Date, default: new Date(), label: 'Created date' },
    createdBy: { type: String, label: 'Created User' },
    modifiedAt: { type: Date, default: new Date(), label: 'Modified date' },
    modifiedBy: { type: String, label: 'Modified User' },
  }),
);

techCardSchema.index({ name: 1 });
techCardSchema.index({ code: 1 });
techCardSchema.index({ 'outputs.productId': 1 });
