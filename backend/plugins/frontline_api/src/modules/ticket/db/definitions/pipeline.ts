import { Schema } from 'mongoose';

export const ticketPipelineSchema = new Schema(
  {
    name: { type: String, required: true },
    userId: { type: String },
    description: String,
    channelId: {
      type: String,
      ref: 'channels',
      required: true,
      index: true,
    },
    order: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  },
);
