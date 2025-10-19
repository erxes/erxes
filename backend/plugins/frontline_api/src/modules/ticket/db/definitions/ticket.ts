import { Schema } from 'mongoose';

export const ticketSchema = new Schema(
  {
    name: { type: String, required: true },
    channelId: { type: String, ref: 'Channel', required: true },
    pipelineId: {
      type: String,
      ref: 'frontline_tickets_pipeline',
      required: true,
    },

    statusId: {
      type: String,
      ref: 'frontline_tickets_pipeline_status',
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['bug', 'task', 'feature', 'question', 'incident'],
      default: 'task',
    },
    priority: { type: Number, default: 2 },

    attachments: [{ filename: String, url: String }],
    labelIds: [String],
    tagIds: [String],
    userId: { type: String, ref: 'User' },
    startDate: Date,
    targetDate: Date,
    statusChangedDate: Date,
    statusType: Number,
  },
  {
    timestamps: true,
  },
);
