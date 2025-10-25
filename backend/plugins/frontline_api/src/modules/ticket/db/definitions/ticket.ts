import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const ticketSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String },
    channelId: { type: String, ref: 'Channel' },
    pipelineId: {
      type: String,
      ref: 'frontline_tickets_pipeline',
    },
    statusId: {
      type: String,
      ref: 'frontline_tickets_pipeline_status',
      required: true,
    },
    description: String,
    type: {
      type: String,
      enum: ['bug', 'ticket', 'feature', 'question', 'incident'],
      default: 'ticket',
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
