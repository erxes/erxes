import { Schema } from 'mongoose';

export const noteSchema = new Schema(
  {
    content: { type: String, required: true },
    contentId: { type: String, required: true },
    createdBy: { type: String, required: true },
    mentions: { type: [String], default: [] },
    statusId: { type: String },
  },
  {
    timestamps: true,
  },
);
