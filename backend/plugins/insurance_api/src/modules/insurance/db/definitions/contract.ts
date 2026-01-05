import mongoose, { Schema } from 'mongoose';

export const insuranceContractSchema = new Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'vendors',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'insurance_customers',
      required: true,
    },
    insuranceType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'insurance_types',
      required: true,
    },
    insuranceProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'products',
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
    chargedAmount: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    insuredObject: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    paymentKind: {
      type: String,
      enum: ['qpay', 'cash'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    contractNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);
