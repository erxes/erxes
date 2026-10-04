import { Schema } from 'mongoose';
import { attachmentSchema } from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const telegramConversationMessageSchema = new Schema({
  _id: mongooseStringRandomId,
  integrationId: {
    type: String,
    required: true,
  },
  chatId: {
    type: String,
    required: true,
  },
  messageId: {
    type: String,
    required: true,
    label: 'Telegram message id',
  },
  conversationId: {
    type: String,
    required: true,
    index: true,
  },
  erxesApiId: {
    type: String,
    label: 'Inbox message id',
  },
  content: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    required: true,
    index: true,
  },
  updatedAt: Date,
  attachments: [attachmentSchema],
  customerId: { type: String, index: true },
  userId: { type: String, index: true },
});

telegramConversationMessageSchema.index(
  { integrationId: 1, chatId: 1, messageId: 1 },
  { unique: true },
);
