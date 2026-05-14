import { Schema } from 'mongoose';

export const customerSchema = new Schema(
  {
    companyName: {
      type: String,
    },
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    type: {
      type: String,
      enum: ['individual', 'company'],
      required: true,
    },
    registrationNumber: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
    },
  },
  {
    timestamps: true,
    discriminatorKey: 'type',
  },
);
