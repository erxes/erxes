import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { conversationSchema } from '@/integrations/facebook/db/definitions/conversations';
import {IFacebookConversationDocument } from '@/integrations/facebook/@types/conversations';

export interface IFacebookConversationModel extends Model<IFacebookConversationDocument> {
  getConversation(selector): Promise<IFacebookConversationDocument>;
}

export const loadFacebookConversationClass = (models: IModels) => {
  class Conversation {
    public static async getConversation(selector) {
      const conversation = await models.FacebookConversations.findOne(selector);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return conversation;
    }
  }

  conversationSchema.loadClass(Conversation);

  return conversationSchema;
};
