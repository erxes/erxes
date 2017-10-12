import mongoose from 'mongoose';
import Random from 'meteor-random';
import { CONVERSATION_STATUSES, FACEBOOK_DATA_KINDS } from '../../data/constants';

const TwitterDirectMessageSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  senderId: {
    type: Number,
  },
  senderIdStr: {
    type: String,
  },
  recipientId: {
    type: Number,
  },
  recipientIdStr: {
    type: String,
  },
});

// Twitter schema
const TwitterSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  idStr: {
    type: String,
  },
  screenName: {
    type: String,
  },
  isDirectMessage: {
    type: Boolean,
  },
  directMessage: {
    type: TwitterDirectMessageSchema,
  },
});

// facebook schema
const FacebookSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  kind: {
    type: String,
    enum: FACEBOOK_DATA_KINDS.ALL_LIST,
  },
  senderName: {
    type: String,
  },
  senderId: {
    type: String,
  },
  recipientId: {
    type: String,
  },

  // when wall post
  postId: {
    type: String,
  },

  pageId: {
    type: String,
  },
});

// Conversation schema
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
    enum: CONVERSATION_STATUSES.ALL_LIST,
  },
  messageCount: Number,
  tagIds: [String],

  // number of total conversations
  number: Number,
  twitterData: TwitterSchema,
  facebookData: FacebookSchema,
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
      number: this.find().count() + 1,
      messageCount: 0,
    });
  }

  /**
   * Assign user to conversation
   * @param  {list} conversationIds
   * @param  {String} assignedUserId
   * @return {Promise} Updated conversation id
   */
  static assignUserConversation(conversationIds, assignedUserId) {
    return this.update(
      { _id: { $in: conversationIds } },
      { $set: { assignedUserId } },
      { multi: true },
    );
  }

  /**
   * Unassign user from conversation
   * @param  {list} conversationIds
   * @return {Promise} Updated conversation id
   */
  static unassignUserConversation(conversationIds) {
    return this.update(
      { _id: { $in: conversationIds } },
      { $unset: { assignedUserId: 1 } },
      { multi: true },
    );
  }

  /**
   * Change conversation status
   * @param  {list} conversationIds
   * @param  {String} status
   * @return {Promise} Updated conversation id
   */
  static changeStatusConversation(conversationIds, status) {
    return this.update({ _id: { $in: conversationIds } }, { $set: { status } }, { multi: true });
  }

  /**
   * Add participated user to conversation
   * @param  {Object} selector
   * @param  {String} userId
   * @return {Promise} Updated conversation id
   */
  static addParticipatedUserToConversation(_ids, userId) {
    return this.update(
      { _id: { $in: _ids } },
      { $addToSet: { participatedUserIds: userId } },
      { multi: true },
    );
  }

  /**
   * Remove participated user from conversation
   * @param  {list} _ids
   * @param  {String} userId
   * @return {Promise} Updated conversation id
   */
  static removeParticipatedUserFromConversation(_ids, userId) {
    return this.update(
      { _id: { $in: _ids } },
      { $pull: { participatedUserIds: { $in: [userId] } } },
      { multi: true },
    );
  }

  /**
   * Mark as read conversation
   * @param  {String} _id of conversation
   * @param  {String} userId
   * @param  {Boolean} firstOne
   * @return {Promise} Updated conversation id
   */
  static markAsReadConversation(_id, userId, firstOne) {
    // if current user is first one
    if (firstOne) return this.update({ _id }, { $set: { readUserIds: [userId] } });

    return this.update({ _id }, { $push: { readUserIds: userId } });
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
  facebookData: FacebookSchema,
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
