import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const ticketSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String },
    channelId: { type: String },
    pipelineId: {
      type: String,
      label: 'pipelineId',
    },
    statusId: {
      type: String,
      label: 'statusId',
    },
    state: {
      type: String,
      label: 'state',
    },
    description: { type: String, label: 'Description' },
    type: {
      type: String,
      enum: ['bug', 'ticket', 'feature', 'question', 'incident'],
      default: 'ticket',
    },
    priority: { type: Number, label: 'Priority', default: 0 },
    assigneeId: { type: String, label: 'Assignee' },
    createdBy: { type: String, label: 'Created By' },
    attachments: [{ filename: String, url: String }],
    labelIds: { type: [String], label: 'Label IDs' },
    tagIds: { type: [String], label: 'Tag IDs' },
    userId: { type: String, label: 'userId' },
    statusChangedDate: {
      type: Date,
      label: 'Complated Date',
      default: Date.now,
    },
    startDate: { type: Date, label: 'Start Date' },
    targetDate: { type: Date, label: 'Target Date' },
    number: { type: String, label: 'Number' },
    statusType: { type: Number, label: 'Status Type', default: 0 },
    subscribedUserIds: { type: [String], label: 'subscribed user IDs' },
  },
  {
    timestamps: true,
  },
);
