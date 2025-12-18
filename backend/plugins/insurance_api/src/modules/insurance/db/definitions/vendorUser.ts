import mongoose, { Schema } from 'mongoose';

export const vendorUserSchema = new Schema(
  {
    name: {
      type: String,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InsuranceVendor',
      required: true,
    },
    role: {
      type: String,
      enum: ['user'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  },
);
