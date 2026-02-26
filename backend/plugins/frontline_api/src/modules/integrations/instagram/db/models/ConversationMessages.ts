import * as strip from 'strip';
import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import { conversationMessageSchema } from '@/integrations/instagram/db/definitions/conversationMessages';
import {
  IInstagramConversationMessageDocument,
  IInstagramConversationMessage,
} from '@/integrations/instagram/@types/conversationMessages';

export interface IInstagramConversationMessageModel
  extends Model<IInstagramConversationMessageDocument> {
  getMessage(_id: string): Promise<IInstagramConversationMessageDocument>;
  createMessage(
    doc: IInstagramConversationMessage,
  ): Promise<IInstagramConversationMessageDocument>;
  addMessage(
    doc: IInstagramConversationMessage,
    userId?: string,
  ): Promise<IInstagramConversationMessageDocument>;
}

export const loadInstagramConversationMessageClass = (models: IModels) => {
  class Message {
    /**
     * Retreives message
     */
    public static async getMessage(_id: string) {
      const message = await models.InstagramConversationMessages.findOne({
        _id,
      }).lean();

      if (!message) {
        throw new Error('Conversation message not found');
      }

      return message;
    }
    /**
     * Create a message
     */
    public static async createMessage(doc: IInstagramConversationMessage) {
      const message = await models.InstagramConversationMessages.create({
        ...doc,
        createdAt: doc.createdAt || new Date(),
      });

      return message;
    }

    /**
     * Create a conversation message
     */
    public static async addMessage(
      doc: IInstagramConversationMessage,
      userId?: string,
    ) {
      const conversation = await models.InstagramConversations.findOne({
        _id: doc.conversationId,
      });

      if (!conversation) {
        throw new Error(`Conversation not found with id ${doc.conversationId}`);
      }

      const content = doc.content || '';
      const attachments = doc.attachments || [];

      doc.content = content;
      doc.attachments = attachments;

      const contentValid =
        content.indexOf('<img') !== -1 ? true : strip(content);

      if (attachments.length === 0 && !contentValid) {
        throw new Error('Content is required');
      }

      return this.createMessage({ ...doc, userId });
    }
  }

  conversationMessageSchema.loadClass(Message);

  return conversationMessageSchema;
};
