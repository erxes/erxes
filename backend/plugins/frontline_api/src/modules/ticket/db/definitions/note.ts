import { Schema } from 'mongoose';
import { NOTE_TYPES } from '@/ticket/@types/note';

export const noteSchema = new Schema(
  {
    content: { type: String, required: true },
    contentId: { type: String, required: true },
    createdBy: { type: String, required: true },
    mentions: { type: [String], default: [] },
    statusId: { type: String },
    type: { type: String, enum: NOTE_TYPES, default: 'note', index: true },
  },
  {
    timestamps: true,
  },
);
