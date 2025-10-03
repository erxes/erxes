import { Schema } from 'mongoose';

const metadataSchema = new Schema(
  {
    newValue: { type: String, label: 'New Value' },
    previousValue: { type: String, label: 'Previous Value' },
  },
  {
    _id: false,
  },
);

export const activitySchema = new Schema(
  {
    action: { type: String, label: 'Action', required: true },
    contentId: {
      type: Schema.Types.ObjectId,
      label: 'Content ID',
      required: true,
    },
    module: { type: String, label: 'Module', required: true },
    metadata: { type: metadataSchema, label: 'Metadata' },
    createdBy: { type: String, label: 'Created By' },
  },
  {
    timestamps: true,
  },
);
