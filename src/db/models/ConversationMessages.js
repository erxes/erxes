import strip from 'strip';
import mongoose from 'mongoose';
import { TwitterResponseSchema } from '../../trackers/schemas';
import { Conversations } from './';
import { field } from './utils';

const reactionSchema = mongoose.Schema(
  {
    like: field({ type: [String], default: [] }),
    love: field({ type: [String], default: [] }),
    wow: field({ type: [String], default: [] }),
    haha: field({ type: [String], default: [] }),
    sad: field({ type: [String], default: [] }),
    angry: field({ type: [String], default: [] }),
  },
  { _id: false },
);

const FacebookSchema = mongoose.Schema(
  {
    postId: field({
      type: String,
      optional: true,
    }),

    commentId: field({
      type: String,
      optional: true,
    }),

    // parent comment id
    parentId: field({
      type: String,
      optional: true,
    }),

    isPost: field({
      type: Boolean,
      optional: true,
    }),

    reactions: field({ reactionSchema }),

    likeCount: field({
      type: Number,
      default: 0,
    }),
    commentCount: field({
      type: Number,
      default: 0,
    }),
    shareCount: field({
      type: Number,
      default: 0,
    }),

    // messenger message id
    messageId: field({
      type: String,
      optional: true,
    }),

    // comment, reaction, etc ...
    item: field({
      type: String,
      optional: true,
    }),

    // photo link when included photo
    photo: field({
      type: String,
      optional: true,
    }),

    // video link when included video
    video: field({
      type: String,
      optional: true,
    }),

    // photo links when user posted multiple photos
    photos: field({
      type: [String],
      optional: true,
    }),

    link: field({
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
  twitterData: field({ type: TwitterResponseSchema }),
});

class Message {
  /**
   * Create a message
   * @param  {Object} messageObj - object
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

    await Conversations.update(
      { _id: message.conversationId },
      {
        $set: {
          messageCount,

          // updating updatedAt
          updatedAt: new Date(),
        },
      },
    );

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
   * @param  {Object} doc - Conversation message fields
   * @param  {Object} user - Object
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

    // setting conversation's content to last message
    await Conversations.update({ _id: doc.conversationId }, { $set: { content } });

    return this.createMessage({ ...doc, userId });
  }

  /**
  * User's last non answered question
  * @param  {String} conversationId
  * @return {Promise} Message object
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
   * @return {Promise} Updated messages info
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
