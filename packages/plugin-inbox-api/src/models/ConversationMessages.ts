import { Model, model } from 'mongoose';
import strip from 'strip';
import { Conversations } from '.';
import { MESSAGE_TYPES } from './definitions/constants';
import {
  IMessage,
  IMessageDocument,
  messageSchema
} from './definitions/conversationMessages';

export interface IMessageModel extends Model<IMessageDocument> {
  getMessage(_id: string): Promise<IMessageDocument>;
  createMessage(doc: IMessage): Promise<IMessageDocument>;
  addMessage(doc: IMessage, userId?: string): Promise<IMessageDocument>;
  getNonAsnweredMessage(conversationId: string);
  getAdminMessages(conversationId: string);
  widgetsGetUnreadMessagesCount(conversationId: string): Promise<number>;
  markSentAsReadMessages(conversationId: string): Promise<IMessageDocument>;
  forceReadCustomerPreviousEngageMessages(
    customerId: string
  ): Promise<IMessageDocument>;
  updateVisitorEngageMessages(visitorId: string, customerId: string);
}

export const loadClass = () => {
  class Message {
    /**
     * Retreives message
     */
    public static async getMessage(_id: string) {
      const message = await Messages.findOne({ _id });

      if (!message) {
        throw new Error('Conversation message not found');
      }

      return message;
    }
    /**
     * Create a message
     */
    public static async createMessage(doc: IMessage) {
      const message = await Messages.create({
        internal: false,
        ...doc,
        createdAt: doc.createdAt || new Date()
      });

      const messageCount = await Messages.find({
        conversationId: message.conversationId
      }).countDocuments();

      // update conversation ====
      const convDocModifier: {
        messageCount?: number;
        updatedAt: Date;
        isCustomerRespondedLast?: boolean;
      } = {
        updatedAt: new Date()
      };

      if (!doc.fromBot) {
        convDocModifier.messageCount = messageCount;
        convDocModifier.isCustomerRespondedLast = doc.customerId ? true : false;
      }

      await Conversations.updateConversation(
        message.conversationId,
        convDocModifier
      );

      if (message.userId) {
        // add created user to participators
        await Conversations.addParticipatedUsers(
          message.conversationId,
          message.userId
        );
      }

      // add mentioned users to participators
      await Conversations.addManyParticipatedUsers(
        message.conversationId,
        message.mentionedUserIds || []
      );

      return message;
    }

    /**
     * Create a conversation message
     */
    public static async addMessage(doc: IMessage, userId?: string) {
      const conversation = await Conversations.findOne({
        _id: doc.conversationId
      });

      if (!conversation) {
        throw new Error(`Conversation not found with id ${doc.conversationId}`);
      }

      // normalize content, attachments
      const content = doc.content || '';
      const attachments = doc.attachments || [];

      doc.content = content;
      doc.attachments = attachments;

      // <img> tags wrapped inside empty <p> tag should be allowed
      const contentValid =
        content.indexOf('<img') !== -1 ? true : strip(content);

      // if there is no attachments and no content then throw content required error
      if (
        doc.contentType !== MESSAGE_TYPES.VIDEO_CALL &&
        attachments.length === 0 &&
        !contentValid
      ) {
        throw new Error('Content is required');
      }

      // setting conversation's content to last message & first responded user
      const modifier: {
        content?: string;
        firstRespondedUserId?: string;
        firstRespondedDate?: Date;
      } = {};

      if (!doc.fromBot && !doc.internal) {
        modifier.content = doc.content;
      }

      if (!conversation.firstRespondedUserId) {
        modifier.firstRespondedUserId = userId;
        modifier.firstRespondedDate = new Date();
      }

      await Conversations.updateConversation(doc.conversationId, modifier);

      return this.createMessage({ ...doc, userId });
    }

    /**
     * User's last non answered question
     */
    public static getNonAsnweredMessage(conversationId: string) {
      return Messages.findOne({
        conversationId,
        customerId: { $exists: true }
      }).sort({ createdAt: -1 });
    }

    /**
     * Get admin messages
     */
    public static getAdminMessages(conversationId: string) {
      return Messages.find({
        conversationId,
        userId: { $exists: true },
        isCustomerRead: { $ne: true },

        // exclude internal notes
        internal: false
      }).sort({ createdAt: 1 });
    }

    public static widgetsGetUnreadMessagesCount(conversationId: string) {
      return Messages.countDocuments({
        conversationId,
        userId: { $exists: true },
        internal: false,
        isCustomerRead: { $ne: true }
      });
    }

    /**
     * Mark sent messages as read
     */
    public static markSentAsReadMessages(conversationId: string) {
      return Messages.updateMany(
        {
          conversationId,
          userId: { $exists: true },
          isCustomerRead: { $ne: true }
        },
        { $set: { isCustomerRead: true } },
        { multi: true }
      );
    }

    /**
     * Force read previous unread engage messages ============
     */
    public static forceReadCustomerPreviousEngageMessages(customerId: string) {
      return Messages.updateMany(
        {
          customerId,
          engageData: { $exists: true },
          'engageData.engageKind': { $ne: 'auto' },
          isCustomerRead: { $ne: true }
        },
        { $set: { isCustomerRead: true } }
      );
    }

    public static async updateVisitorEngageMessages(
      visitorId: string,
      customerId: string
    ) {
      return Messages.updateMany(
        {
          visitorId,
          engageData: { $exists: true }
        },
        { $set: { customerId, visitorId: '' } }
      );
    }
  }

  messageSchema.loadClass(Message);

  return messageSchema;
};

loadClass();

// tslint:disable-next-line
const Messages = model<IMessageDocument, IMessageModel>(
  'conversation_messages',
  messageSchema
);

export default Messages;
