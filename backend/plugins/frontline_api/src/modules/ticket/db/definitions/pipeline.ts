import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const ticketPipelineSchema = new Schema(
  {
    _id: mongooseStringRandomId,
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
  },
  {
    timestamps: true,
  },
);
