import mongoose, { Schema } from 'mongoose';

export const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    insuranceType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'insurance_types',
      required: true,
    },
    coveredRisks: [
      {
        risk: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'risk_types',
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
    pdfContent: {
      type: String,
      required: false,
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'insurance_contract_templates',
      required: false,
    },
    additionalCoverages: [
      {
        name: {
          type: String,
          required: true,
        },
        limits: {
          type: [Number],
          required: true,
        },
        appliesTo: {
          type: [String],
          required: false,
        },
      },
    ],
    compensationCalculations: [
      {
        name: {
          type: String,
          required: true,
        },
        methodologies: {
          type: [String],
          required: true,
        },
      },
    ],
    deductibleConfig: {
      levels: {
        type: [String],
        required: false,
      },
    },
  },
  {
    timestamps: true,
  },
);
