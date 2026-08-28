import { Schema } from 'mongoose';
import { attachmentSchema } from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const conversationMessageSchema = new Schema({
  _id: mongooseStringRandomId,
  messageId: {
    type: String,
    unique: true,
    sparse: true,
    label: 'Discord message id',
  },
  content: { type: String },
  attachments: [attachmentSchema],
  replyTo: { type: Object, optional: true },
  conversationId: { type: String, index: true },
  customerId: { type: String, index: true },
  userId: { type: String, index: true },
  createdAt: { type: Date, index: true, label: 'Created At' },
  updatedAt: { type: Date, index: true, label: 'Updated At' },
  deletedAt: { type: Date, label: 'Deleted on Discord at' },
  internal: { type: Boolean, label: 'Internal' },
  fromBot: { type: Boolean },
});
