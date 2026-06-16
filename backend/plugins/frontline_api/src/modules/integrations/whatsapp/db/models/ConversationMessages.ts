import { stripHtml } from 'string-strip-html';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { conversationMessageSchema } from '@/integrations/whatsapp/db/definitions/conversationMessages';
import {
  IWhatsappConversationMessage,
  IWhatsappConversationMessageDocument,
} from '@/integrations/whatsapp/@types/conversationMessages';

export interface IWhatsappConversationMessageModel
  extends Model<IWhatsappConversationMessageDocument> {
  createMessage(
    doc: IWhatsappConversationMessage,
  ): Promise<IWhatsappConversationMessageDocument>;
  addMessage(
    doc: IWhatsappConversationMessage,
    userId?: string,
  ): Promise<IWhatsappConversationMessageDocument>;
}

export const loadWhatsappConversationMessageClass = (models: IModels) => {
  class Message {
    public static async createMessage(doc: IWhatsappConversationMessage) {
      return models.WhatsappConversationMessages.create({
        ...doc,
        createdAt: doc.createdAt || new Date(),
      });
    }

    public static async addMessage(
      doc: IWhatsappConversationMessage,
      userId?: string,
    ) {
      const conversation = await models.WhatsappConversations.findOne({
        _id: doc.conversationId,
      });

      if (!conversation) {
        throw new Error(`Conversation not found with id ${doc.conversationId}`);
      }

      const content = doc.content || '';
      const attachments = doc.attachments || [];
      const plainText = stripHtml(content).result.trim();

      if (attachments.length === 0 && !plainText) {
        throw new Error('Content is required');
      }

      return this.createMessage({
        ...doc,
        content,
        attachments,
        userId,
      });
    }
  }

  conversationMessageSchema.loadClass(Message);

  return conversationMessageSchema;
};
