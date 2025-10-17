import { Schema } from 'mongoose';

export const ticketSchema = new Schema(
  {
    name: { type: String, required: true },
    channelId: { type: String, ref: 'Channel', required: true },
    pipelineId: {
      type: Schema.Types.ObjectId,
      ref: 'TicketPipeline',
      required: true,
    },
    statusId: { type: Schema.Types.ObjectId, ref: 'Status', required: true },
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
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    startDate: Date,
    targetDate: Date,
    statusChangedDate: Date,
    statusType: Number,
  },
  {
    timestamps: true,
  },
);
