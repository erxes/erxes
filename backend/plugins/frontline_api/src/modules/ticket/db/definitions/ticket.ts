import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { attachmentSchema } from 'erxes-api-shared/core-modules';

export const ticketSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, label: 'Name' },
    channelId: { type: String, label: 'Channel' },
    stageId: { type: String, label: 'Stage' },
    pipelineId: {
      type: String,
      label: 'Pipeline',
    },
    statusId: {
      type: String,
      label: 'Status',
    },
    state: {
      type: String,
      label: 'State',
    },
    description: { type: String, label: 'Description' },
    type: {
      type: String,
      enum: ['bug', 'ticket', 'feature', 'question', 'incident'],
      default: 'ticket',
      label: 'Type',
    },
    priority: { type: Number, label: 'Priority', default: 0 },
    assigneeId: { type: String, label: 'Assignee' },
    createdBy: { type: String, label: 'Created By' },
    attachments: { type: [attachmentSchema], label: 'Attachments' },
    labelIds: { type: [String], label: 'Labels' },
    tagIds: { type: [String], label: 'Tags' },
    userId: { type: String, label: 'Created by' },
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
    propertiesData: {
      type: Schema.Types.Mixed,
      optional: true,
      label: 'Properties data',
    },
    companyIds: { type: [String], label: 'Companies' },
    customerFieldData: {
      type: Schema.Types.Mixed,
      optional: true,
      label: 'Customer field data',
    },
  },
  {
    timestamps: true,
  },
);
