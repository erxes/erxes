import { Schema } from 'mongoose';

export const noteSchema = new Schema(
  {
    content: { type: String },
    contentId: { type: Schema.Types.ObjectId },
    createdBy: { type: String },
    mentions: { type: [String], default: [] },
  },
  {
    timestamps: true,
  },
);
