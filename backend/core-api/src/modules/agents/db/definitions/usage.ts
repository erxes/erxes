import { Schema } from 'mongoose';

export const agentsUsageSchema = new Schema(
  {
    _id: { type: String },
    month: { type: String, required: true },
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);
