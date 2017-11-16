import strip from 'strip';
import mongoose from 'mongoose';
import { Conversations } from './';
import { field } from './utils';

const FacebookSchema = mongoose.Schema(
  {
    commentId: field({
      type: String,
      optional: true,
    }),

    // comment, reaction, etc ...
    item: field({
      type: String,
      optional: true,
    }),

    // when share photo
    photoId: field({
      type: String,
      optional: true,
    }),

    // when share video
    videoId: field({
      type: String,
      optional: true,
    }),

    link: field({
      type: String,
      optional: true,
    }),

    reactionType: field({
      type: String,
      optional: true,
    }),

    senderId: field({
      type: String,
      optional: true,
    }),

    senderName: field({
      type: String,
      optional: true,
    }),
  },
  { _id: false },
);

const MessageSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  content: field({ type: String }),
  attachments: field({ type: Object }),
  mentionedUserIds: field({ type: [String] }),
  conversationId: field({ type: String }),
  internal: field({ type: Boolean }),
  customerId: field({ type: String }),
  userId: field({ type: String }),
  createdAt: field({ type: Date }),
  isCustomerRead: field({ type: Boolean }),
  engageData: field({ type: Object }),
  formWidgetData: field({ type: Object }),
  facebookData: field({ type: FacebookSchema }),
});

class Message {
  /**
   * Create a message
   * @param  {Object} messageObj object
   * @return {Promise} Newly created message object
   */
  static async createMessage(doc) {
    const message = await this.create({
      internal: false,
      ...doc,
      createdAt: new Date(),
    });

    const messageCount = await this.find({
      conversationId: message.conversationId,
    }).count();

    await Conversations.update({ _id: message.conversationId }, { $set: { messageCount } });

    // add created user to participators
    await Conversations.addParticipatedUsers(message.conversationId, message.userId);

    // add mentioned users to participators
    for (let userId of message.mentionedUserIds) {
      await Conversations.addParticipatedUsers(message.conversationId, userId);
    }

    return message;
  }

  /**
   * Create a conversation message
   * @param  {Object} doc - conversation message fields
   * @param  {Object} user object
   * @return {Promise} Newly created conversation object
   */
  static async addMessage(doc, userId) {
    const conversation = await Conversations.findOne({ _id: doc.conversationId });

    if (!conversation) throw new Error(`Conversation not found with id ${doc.conversationId}`);

    // normalize content, attachments
    const content = doc.content || '';
    const attachments = doc.attachments || [];

    doc.content = content;
    doc.attachments = attachments;

    // if there is no attachments and no content then throw content required error
    if (attachments.length === 0 && !strip(content)) throw new Error('Content is required');

    await Conversations.update(
      { _id: doc.conversationId },
      {
        $set: {
          // setting conversation's content to last message
          content,

          // updating updatedAt
          updatedAt: new Date(),
        },
      },
    );

    return this.createMessage({ ...doc, userId });
  }

  /**
   * Remove a messages
   * @param  {Object} selector
   * @return {Promise} Deleted messages info
   */
  static async removeMessages(selector) {
    const messages = await this.find(selector);
    const result = await this.remove(selector);

    for (let message of messages) {
      const messageCount = await Messages.find({
        conversationId: message.conversationId,
      }).count();

      await Conversations.update({ _id: message.conversationId }, { $set: { messageCount } });
    }

    return result;
  }

  /**
  * User's last non answered question
  * @param  {String} conversationId
  * @return {Promise} message object
  */
  static getNonAsnweredMessage(conversationId) {
    return this.findOne({
      conversationId: conversationId,
      customerId: { $exists: true },
    }).sort({ createdAt: -1 });
  }

  /**
   * Get admin messages
   * @param  {String} conversationId
   * @return {Promise} messages
   */
  static getAdminMessages(conversationId) {
    return this.find({
      conversationId: conversationId,
      userId: { $exists: true },
      isCustomerRead: false,

      // exclude internal notes
      internal: false,
    }).sort({ createdAt: 1 });
  }

  /**
   * Mark sent messages as read
   * @param  {String} conversationId
   * @return {Promise} updated messages info
   */
  static markSentAsReadMessages(conversationId) {
    return this.update(
      {
        conversationId: conversationId,
        userId: { $exists: true },
        isCustomerRead: { $exists: false },
      },
      { $set: { isCustomerRead: true } },
      { multi: true },
    );
  }
}

MessageSchema.loadClass(Message);

const Messages = mongoose.model('conversation_messages', MessageSchema);

export default Messages;
