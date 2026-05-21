import { Schema } from 'mongoose';
export const pricingFixedValueSchema = new Schema(
  {
    productId: { type: String },
    uom: { type: String },
    unitPrice: { type: Number },
    newPrice: { type: Number },
  },
  {
    _id: false,
  },
);
