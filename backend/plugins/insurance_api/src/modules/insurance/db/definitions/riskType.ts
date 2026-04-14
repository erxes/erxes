import { Schema } from 'mongoose';

export const riskTypeSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true },
);
