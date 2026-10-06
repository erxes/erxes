import { Schema } from 'mongoose';

// The fixed price of a line sold under a product condition, instead of newPrice.
const conditionPriceSchema = new Schema(
  {
    conditionId: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

export const pricingFixedValueSchema = new Schema(
  {
    pricingPlanId: { type: String, required: true, index: true },
    productId: { type: String, index: true },
    sortField: { type: String, index: true },
    uom: { type: String },
    unitPrice: { type: Number },
    newPrice: { type: Number },
    conditionPrices: { type: [conditionPriceSchema], default: [] },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  { timestamps: true },
);
