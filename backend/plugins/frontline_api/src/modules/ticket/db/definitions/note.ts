import { Schema } from 'mongoose';
import { attachmentSchema } from 'erxes-api-shared/core-modules';
import { INote } from '@/ticket/@types/note';

function requiresContent(this: INote) {
  return !this.attachments?.length && !this.mailMessageId;
}

export const noteSchema = new Schema(
  {
    content: { type: String, required: requiresContent },
    contentId: { type: String, required: true },
    createdBy: { type: String, required: true },
    mentions: { type: [String], default: [] },
    attachments: { type: [attachmentSchema], label: 'Attachments' },
    isInternal: {
      type: Boolean,
      default: false,
      index: true,
      label: 'Internal note',
    },
    statusId: { type: String },
    mailMessageId: { type: String },
  },
  {
    timestamps: true,
  },
);
