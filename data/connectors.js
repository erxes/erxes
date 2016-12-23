/* eslint-disable new-cap */

import Mongoose from 'mongoose';
import settings from '../server-settings';

Mongoose.connect(
  settings.MONGO_URL, {
    server: {
      auto_reconnect: true,
    },
  }
);

const ConversationSchema = Mongoose.Schema({
  _id: String,
  content: String,
});

const AttachmentSchema = Mongoose.Schema({
  url: String,
  name: String,
  size: Number,
  type: String,
});

const MessageSchema = Mongoose.Schema({
  _id: String,
  userId: String,
  conversationId: String,
  content: String,
  attachments: [AttachmentSchema],
  createdAt: Date,
  isCustomerRead: Boolean,
});

const UserSchema = Mongoose.Schema({
  _id: String,
  details: {
    avatar: String,
  },
});

const Conversations = Mongoose.model('conversations', ConversationSchema);
const Messages = Mongoose.model('conversation_messages', MessageSchema);
const Users = Mongoose.model('users', UserSchema);

export { Conversations, Messages, Users };
