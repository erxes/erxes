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
  attachmentFileIds: [String],
  metadata: {
    chatType: String,
    senderName: String,
    messageId: String,
    messageIds: [String],
    contentType: String,
    mediaGroupId: String,
    editedAt: String,
    topicName: String,
    replyTo: {
      messageId: String,
      chatId: String,
      senderName: String,
      content: String,
    },
  },
  pollId: { type: String, index: true },
  poll: {
    type: new Schema(
      {
        question: String,
        answers: [{ _id: false, id: String, text: String }],
        allowMultiselect: Boolean,
        expiry: String,
        results: {
          isFinalized: Boolean,
          totalVoters: Number,
          answerCounts: [{ _id: false, id: String, count: Number }],
        },
      },
      { _id: false },
    ),
    default: undefined,
  },
  processedEditDate: Number,
  processedUpdateId: Number,
  pollUpdateId: Number,
  pollUpdateAt: Date,
  customerId: { type: String, index: true },
  userId: { type: String, index: true },
  senderName: String,
  processingToken: String,
  processingUntil: Date,
});

telegramConversationMessageSchema.index(
  { integrationId: 1, chatId: 1, messageId: 1 },
  { unique: true },
);
