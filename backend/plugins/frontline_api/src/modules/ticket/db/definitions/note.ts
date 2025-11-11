import { Schema } from 'mongoose';

export const noteSchema = new Schema(
  {
    content: { type: String },
    contentId: { type: String },
    createdBy: { type: String },
    mentions: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);
