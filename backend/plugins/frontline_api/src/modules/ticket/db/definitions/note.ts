import { Schema } from 'mongoose';
import { attachmentSchema } from 'erxes-api-shared/core-modules';

export const noteSchema = new Schema(
  {
    content: { type: String, required: true },
    contentId: { type: String, required: true },
    createdBy: { type: String, required: true },
    mentions: { type: [String], default: [] },
    attachments: { type: [attachmentSchema], label: 'Attachments' },
    isInternal: { type: Boolean, default: false, label: 'Internal note' },
    statusId: { type: String },
  },
  {
    timestamps: true,
  },
);
