import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import { conversationSchema } from '@/integrations/instagram/db/definitions/conversations';
import { IInstagramConversationDocument } from '@/integrations/instagram/@types/conversations';

export interface IInstagramConversationModel extends Model<IInstagramConversationDocument> {
  getConversation(selector): Promise<IInstagramConversationDocument>;
}

export const loadInstagramConversationClass = (models: IModels) => {
  class Conversation {
    public static async getConversation(selector) {
      const conversation =
        await models.InstagramConversations.findOne(selector);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return conversation;
    }
  }

  conversationSchema.loadClass(Conversation);

  return conversationSchema;
};
