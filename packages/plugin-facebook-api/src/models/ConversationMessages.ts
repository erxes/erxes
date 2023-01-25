import * as strip from 'strip';
import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  IConversationMessage,
  IConversationMessageDocument,
  conversationMessageSchema
} from './definitions/conversationMessages';

export interface IConversationMessageModel
  extends Model<IConversationMessageDocument> {
  getMessage(_id: string): Promise<IConversationMessageDocument>;
  createMessage(
    doc: IConversationMessage
  ): Promise<IConversationMessageDocument>;
  addMessage(
    doc: IConversationMessage,
    userId?: string
  ): Promise<IConversationMessageDocument>;
}

export const loadConversationMessageClass = (models: IModels) => {
  class Message {
    /**
     * Retreives message
     */
    public static async getMessage(_id: string) {
      const message = await models.ConversationMessages.findOne({ _id }).lean();

      if (!message) {
        throw new Error('Conversation message not found');
      }

      return message;
    }
    /**
     * Create a message
     */
    public static async createMessage(doc: IConversationMessage) {
      const message = await models.ConversationMessages.create({
        internal: false,
        ...doc,
        createdAt: doc.createdAt || new Date()
      });

      return message;
    }

    /**
     * Create a conversation message
     */
    public static async addMessage(doc: IConversationMessage, userId?: string) {
      const conversation = await models.Conversations.findOne({
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
      if (attachments.length === 0 && !contentValid) {
        throw new Error('Content is required');
      }

      return this.createMessage({ ...doc, userId });
    }
  }

  conversationMessageSchema.loadClass(Message);

  return conversationMessageSchema;
};
