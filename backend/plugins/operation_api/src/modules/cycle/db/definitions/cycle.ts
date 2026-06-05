import { Schema } from 'mongoose';

export const cycleSchema = new Schema(
  {
    name: { type: String },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    teamId: { type: Schema.Types.ObjectId },
    isCompleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    statistics: { type: Object },
    donePercent: { type: Number, default: 0 },
    unFinishedTasks: { type: [Schema.Types.ObjectId], default: [] },
    number: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);
