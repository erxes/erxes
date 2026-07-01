import { Schema } from 'mongoose';

export const pricingFixedValueSchema = new Schema(
  {
    pricingPlanId: { type: String, required: true, index: true },
    productId: { type: String, index: true },
    sortField: { type: String, index: true },
    uom: { type: String },
    unitPrice: { type: Number },
    newPrice: { type: Number },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true },
);
