import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const internalNoteSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    contentType: {
      type: String,
      label: 'Content type',
      index: true,
    },
    contentTypeId: { type: String, label: 'Content item', index: true },
    content: { type: String, label: 'Content' },
    createdUserId: { type: String, label: 'Created by' },
  },
  {
    timestamps: true,
  },
);
