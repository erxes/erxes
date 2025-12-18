import mongoose, { Schema } from 'mongoose';

export const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    insuranceType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InsuranceType',
      required: true,
    },
    coveredRisks: [
      {
        risk: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'RiskType',
          required: true,
        },
        coveragePercentage: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
      },
    ],
    pricingConfig: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
