import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const statusSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, required: true },
    description: { type: String, label: 'Description' },
    pipelineId: { type: String, required: true },
    color: { type: String, label: 'Color', default: '#4F46E5' },
    type: { type: Number, label: 'Type', required: true },
    order: { type: Number, label: 'Order', required: true },
  },
  {
    timestamps: true,
  },
);
