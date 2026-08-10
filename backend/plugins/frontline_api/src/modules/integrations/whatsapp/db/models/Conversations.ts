import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { conversationSchema } from '@/integrations/whatsapp/db/definitions/conversations';
import { IWhatsappConversationDocument } from '@/integrations/whatsapp/@types';

export interface IWhatsappConversationModel
  extends Model<IWhatsappConversationDocument> {
  getConversation(
    selector: FilterQuery<IWhatsappConversationDocument>,
  ): Promise<IWhatsappConversationDocument>;
}

/** Builds the WhatsApp conversation model class bound to this tenant's models. */
export const loadWhatsappConversationClass = (models: IModels) => {
  /** One WhatsApp thread with a single contact. */
  class Conversation {
    /** Finds one conversation, throwing when there is none. */
    public static async getConversation(
      selector: FilterQuery<IWhatsappConversationDocument>,
    ) {
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
