import { Schema } from 'mongoose';

export const milestoneSchema = new Schema(
  {
    name: { type: String },
    description: { type: String },
    targetDate: { type: Date },
    projectId: { type: Schema.Types.ObjectId },
    createdBy: { type: String, label: 'Created By' },
  },
  {
    timestamps: true,
  },
);
