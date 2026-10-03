import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const telegramConversationSchema = new Schema({
  _id: mongooseStringRandomId,
  integrationId: {
    type: String,
    required: true,
    label: 'Inbox integration id',
  },
  erxesApiId: {
    type: String,
    label: 'Inbox conversation id',
  },
  chatId: {
    type: String,
    required: true,
    label: 'Telegram chat id',
  },
  chatType: {
    type: String,
    required: true,
    enum: ['private', 'group', 'supergroup', 'channel'],
  },
  chatTitle: String,
  messageThreadId: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    validate: Number.isSafeInteger,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  content: {
    type: String,
    default: '',
  },
});

telegramConversationSchema.index(
  {
    integrationId: 1,
    chatId: 1,
    messageThreadId: 1,
  },
  {
    unique: true,
  },
);
