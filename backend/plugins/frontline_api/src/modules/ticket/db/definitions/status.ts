import { Schema } from 'mongoose';

export const statusSchema = new Schema(
  {
    name: { type: String, required: true },
    pipelineId: { type: String, ref: 'frontline_tickets_pipeline' },
    channelId: {
      type: String,
      ref: 'channels',
      required: true,
      index: true,
    },
    description: String,
    color: { type: String, label: 'Color', default: '#4F46E5' },
    type: { type: Number, label: 'Type', required: true },
    order: { type: Number, label: 'Order', required: true },
  },
  {
    timestamps: true,
  },
);
