import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const pipelineLabelSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, label: 'Name' },
    colorCode: { type: String, label: 'Color code' },
    pipelineId: { type: String, label: 'Pipeline' },
    userId: { type: String, label: 'Created by' },
  },
  {
    timestamps: true,
  },
);

pipelineLabelSchema.index(
  { pipelineId: 1, name: 1, colorCode: 1 },
  { unique: true },
);
