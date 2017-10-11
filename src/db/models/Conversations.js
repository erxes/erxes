import mongoose from 'mongoose';
import Random from 'meteor-random';
import { CONVERSATION_STATUSES } from '../../data/constants';

const ConversationSchema = mongoose.Schema({
  _id: { type: String, unique: true, default: () => Random.id() },
  content: String,
  integrationId: {
    type: String,
    required: true,
  },
  customerId: String,
  userId: String,
  assignedUserId: String,
  participatedUserIds: [String],
  readUserIds: [String],
  createdAt: Date,
  status: {
    type: String,
    required: true,
    allowedValues: CONVERSATION_STATUSES.ALL_LIST,
  },
  messageCount: Number,
  tagIds: [String],

  // number of total conversations
  number: Number,
  twitterData: Object,
  facebookData: Object,
});

class Conversation {
  /**
   * Create a conversation
   * @param  {Object} conversationObj object
   * @return {Promise} Newly created conversation object
   */
  static createConversation(doc) {
    return this.create({
      ...doc,
      status: CONVERSATION_STATUSES.NEW,
      createdAt: new Date(),
      number: Conversations.find().count() + 1,
      messageCount: 0,
    });
  }
}

ConversationSchema.loadClass(Conversation);
export const Conversations = mongoose.model('conversations', ConversationSchema);

const MessageSchema = mongoose.Schema({
  _id: { type: String, unique: true, default: () => Random.id() },
  content: String,
  attachments: Object,
  mentionedUserIds: [String],
  conversationId: String,
  internal: Boolean,
  customerId: String,
  userId: String,
  createdAt: Date,
  isCustomerRead: Boolean,
  engageData: Object,
  formWidgetData: Object,
  facebookData: Object,
});

class Message {
  /**
   * Create a message
   * @param  {Object} messageObj object
   * @return {Promise} Newly created message object
   */
  static createMessage(doc) {
    return this.create({
      ...doc,
      createdAt: new Date(),
    });
  }
}

MessageSchema.loadClass(Message);

export const Messages = mongoose.model('conversation_messages', MessageSchema);
