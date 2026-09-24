import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { conversationSchema } from '@/integrations/whatsapp/db/definitions/conversations';
import { IWhatsappConversationDocument } from '@/integrations/whatsapp/@types/conversations';

export interface IWhatsappConversationModel
  extends Model<IWhatsappConversationDocument> {
  getConversation(
    selector: Record<string, unknown>,
  ): Promise<IWhatsappConversationDocument>;
}

export const loadWhatsappConversationClass = (models: IModels) => {
  class Conversation {
    public static async getConversation(selector: Record<string, unknown>) {
      const conversation = await models.WhatsappConversations.findOne(selector);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return conversation;
    }
  }

  conversationSchema.loadClass(Conversation);

  return conversationSchema;
};
