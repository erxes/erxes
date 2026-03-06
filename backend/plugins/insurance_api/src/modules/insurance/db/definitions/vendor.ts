import mongoose, { Schema } from 'mongoose';

export const vendorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    offeredProducts: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'products',
          required: true,
        },
        pricingOverride: {
          type: mongoose.Schema.Types.Mixed,
        },
        templateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'insurance_contract_templates',
          required: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);
