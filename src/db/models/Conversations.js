import mongoose from 'mongoose';
import { CONVERSATION_STATUSES, FACEBOOK_DATA_KINDS } from '../../data/constants';
import { TwitterResponseSchema } from '../../trackers/schemas';
import { Users, ConversationMessages } from '../../db/models';
import { field } from './utils';

// facebook schema
const FacebookSchema = mongoose.Schema(
  {
    kind: field({
      type: String,
      enum: FACEBOOK_DATA_KINDS.ALL,
    }),
    senderName: field({
      type: String,
    }),
    senderId: field({
      type: String,
    }),
    recipientId: field({
      type: String,
    }),

    // when wall post
    postId: field({
      type: String,
    }),

    pageId: field({
      type: String,
    }),
  },
  { _id: false },
);

// Conversation schema
const ConversationSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  content: field({ type: String }),
  integrationId: field({ type: String }),
  customerId: field({ type: String }),
  userId: field({ type: String }),
  assignedUserId: field({ type: String }),
  participatedUserIds: field({ type: [String] }),
  readUserIds: field({ type: [String] }),
  createdAt: field({ type: Date }),
  updatedAt: field({ type: Date }),

  closedAt: field({
    type: Date,
    optional: true,
  }),

  closedUserId: field({
    type: String,
    optional: true,
  }),

  status: field({
    type: String,
    enum: CONVERSATION_STATUSES.ALL,
  }),
  messageCount: field({ type: Number }),
  tagIds: field({ type: [String] }),

  // number of total conversations
  number: field({ type: Number }),
  twitterData: field({ type: TwitterResponseSchema }),
  facebookData: field({ type: FacebookSchema }),
});

class Conversation {
  /**
   * Check conversations exists
   * @param  {list} ids - Ids of conversations
   * @return {object, list} selector, conversations
   */
  static async checkExistanceConversations(_ids) {
    const selector = { _id: { $in: _ids } };
    const conversations = await this.find(selector);

    if (conversations.length !== _ids.length) {
      throw new Error('Conversation not found.');
    }

    return { selector, conversations };
  }

  /**
   * Create a conversation
   * @param  {Object} conversationObj - Object
   * @return {Promise} Newly created conversation object
   */
  static async createConversation(doc) {
    const now = new Date();

    return this.create({
      status: CONVERSATION_STATUSES.NEW,
      ...doc,
      createdAt: now,
      updatedAt: now,
      number: (await this.find().count()) + 1,
      messageCount: 0,
    });
  }

  /*
   * Reopens conversation
   * @param {String} _id - Conversation id
   * @return {Object} updated conversation
   */
  static async reopen(_id) {
    await this.update(
      { _id },
      {
        $set: {
          // reset read state
          readUserIds: [],

          // if closed, reopen
          status: CONVERSATION_STATUSES.OPEN,

          closedAt: null,
          closedUserId: null,
        },
      },
    );

    return this.findOne({ _id });
  }

  /**
   * Assign user to conversation
   * @param  {list} conversationIds
   * @param  {String} assignedUserId
   * @return {Promise} Updated conversation objects
   */
  static async assignUserConversation(conversationIds, assignedUserId) {
    await this.checkExistanceConversations(conversationIds);

    if (!await Users.findOne({ _id: assignedUserId })) {
      throw new Error(`User not found with id ${assignedUserId}`);
    }

    await this.update(
      { _id: { $in: conversationIds } },
      { $set: { assignedUserId } },
      { multi: true },
    );

    return this.find({ _id: { $in: conversationIds } });
  }

  /**
   * Unassign user from conversation
   * @param  {list} conversationIds
   * @return {Promise} Updated conversation objects
   */
  static async unassignUserConversation(conversationIds) {
    await this.checkExistanceConversations(conversationIds);

    await this.update(
      { _id: { $in: conversationIds } },
      { $unset: { assignedUserId: 1 } },
      { multi: true },
    );

    return this.find({ _id: { $in: conversationIds } });
  }

  /**
   * Change conversation status
   * @param  {list} conversationIds
   * @param  {String} status
   * @return {Promise} Updated conversation id
   */
  static changeStatusConversation(conversationIds, status, userId) {
    const query = { status };

    if (status === CONVERSATION_STATUSES.CLOSED) {
      query.closedAt = new Date();
      query.closedUserId = userId;
    } else {
      query.closedAt = null;
      query.closedUserId = null;
    }

    return this.update({ _id: { $in: conversationIds } }, { $set: query }, { multi: true });
  }

  /**
   * Mark as read conversation
   * @param  {String} _id - Id of conversation
   * @param  {String} userId
   * @return {Promise} Updated conversation object
   */
  static async markAsReadConversation(_id, userId) {
    const conversation = await this.findOne({ _id });

    if (!conversation) throw new Error(`Conversation not found with id ${_id}`);

    const readUserIds = conversation.readUserIds;

    // if current user is first one
    if (!readUserIds || readUserIds.length === 0) {
      await this.update({ _id }, { $set: { readUserIds: [userId] } });
    }

    // if current user is not in read users list then add it
    if (!readUserIds.includes(userId)) {
      await this.update({ _id }, { $push: { readUserIds: userId } });
    }

    return this.findOne({ _id });
  }

  /**
   * Get new or open conversation
   * @return {Promise} conversations
   */
  static newOrOpenConversation() {
    return this.find({
      status: { $in: [CONVERSATION_STATUSES.NEW, CONVERSATION_STATUSES.OPEN] },
    });
  }

  /**
   * Add participated user
   * @param {String} conversationId
   * @param {String} userId
   * @return {Promise} updated conversation id
   */
  static addParticipatedUsers(conversationId, userId) {
    if (conversationId && userId) {
      return this.update(
        { _id: conversationId },
        {
          $addToSet: { participatedUserIds: userId },
        },
      );
    }
  }

  /**
   * Transfers customers' conversations to another customer
   * @param {String} newCustomerId - Customer id to set
   * @param {String[]} customerIds - Old customer ids to change
   * @return {Promise} Updated list of conversations of new customer
   */
  static async changeCustomer(newCustomerId, customerIds) {
    for (let customerId of customerIds) {
      // Updating every conversation and conversation messages of new customer
      await ConversationMessages.updateMany(
        { customerId: customerId },
        { $set: { customerId: newCustomerId } },
      );

      await this.updateMany({ customerId: customerId }, { $set: { customerId: newCustomerId } });
    }

    // Returning updated list of conversation of new customer
    return this.find({ customerId: newCustomerId });
  }

  /**
   * Removes customer conversations
   * @param {String} customerId - Customer id to remove
   * @return {Promise} Result
   */
  static async removeCustomerConversations(customerId) {
    // Finding every conversation of customer
    const conversations = await this.find({
      customerId,
    });

    // Removing conversations and conversation messages
    for (let conversation of conversations) {
      // Removing conversation message of conversation
      await ConversationMessages.remove({ conversationId: conversation._id });
      await this.remove({ _id: conversation._id });
    }
  }
}

ConversationSchema.loadClass(Conversation);

const Conversations = mongoose.model('conversations', ConversationSchema);

export default Conversations;
