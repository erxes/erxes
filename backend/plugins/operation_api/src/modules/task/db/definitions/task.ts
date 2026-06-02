import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const taskSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, label: 'Name', required: true },
    description: { type: String, label: 'Description' },
    status: { type: String, label: 'Status ID', required: true },
    teamId: { type: String, label: 'Team ID', required: true },
    priority: { type: Number, label: 'Priority', default: 0 },
    labelIds: { type: [String], label: 'Label IDs' },
    tagIds: { type: [String], label: 'Tag IDs' },
    assigneeId: { type: String, label: 'Assignee' },
    createdBy: { type: String, label: 'Created By' },
    startDate: { type: Date, label: 'Start Date' },
    targetDate: { type: Date, label: 'Target Date' },
    cycleId: { type: String, label: 'Cycle ID' },
    projectId: { type: String, label: 'Project ID' },
    milestoneId: { type: String, label: 'Milestone ID' },
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
