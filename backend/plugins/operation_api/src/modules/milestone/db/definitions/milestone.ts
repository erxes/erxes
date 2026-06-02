import { Schema } from 'mongoose';

export const milestoneSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    targetDate: { type: Date },
    projectId: { type: String, required: true, },
    createdBy: { type: String, label: 'Created By' },
  },
  {
    timestamps: true,
  },
);
