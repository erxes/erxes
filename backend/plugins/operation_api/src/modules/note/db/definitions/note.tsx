import { Schema } from 'mongoose';
import { applyDataExtensionsNamespace } from 'erxes-api-shared/core-modules';

export const noteSchema = new Schema(
  {
    content: { type: String },
    contentId: { type: Schema.Types.ObjectId },
    createdBy: { type: String },
    mentions: { type: [String], default: [] },
    statusId: { type: String },
  },
  {
    timestamps: true,
  },
);

applyDataExtensionsNamespace(noteSchema);
