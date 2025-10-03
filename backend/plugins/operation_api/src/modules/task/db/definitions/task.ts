import { Schema } from 'mongoose';

export const taskSchema = new Schema(
  {
    name: { type: String, label: 'Name', required: true },
    description: { type: String, label: 'Description' },
    status: { type: Schema.Types.ObjectId, label: 'Status ID', required: true },
    teamId: { type: Schema.Types.ObjectId, label: 'Team ID', required: true },
    priority: { type: Number, label: 'Priority', default: 0 },
    labelIds: { type: [String], label: 'Label IDs' },
    tagIds: { type: [String], label: 'Tag IDs' },
    assigneeId: { type: String, label: 'Assignee' },
    createdBy: { type: String, label: 'Created By' },
    startDate: { type: Date, label: 'Start Date' },
    targetDate: { type: Date, label: 'Target Date' },
    cycleId: { type: Schema.Types.ObjectId, label: 'Cycle ID' },
    projectId: { type: Schema.Types.ObjectId, label: 'Project ID' },
    estimatePoint: { type: Number, label: 'Estimate Point', default: 0 },
    statusChangedDate: {
      type: Date,
      label: 'Complated Date',
      default: Date.now,
    },
    number: { type: Number, label: 'Number', default: 0 },
    statusType: { type: Number, label: 'Status Type', default: 0 },
  },
  {
    timestamps: true,
  },
);
