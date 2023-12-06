import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  conversationSchema,
  IConversationDocument
} from './definitions/conversations';

export interface IConversationModel extends Model<IConversationDocument> {
  getConversation(selector): Promise<IConversationDocument>;
}

export const loadConversationClass = (models: IModels) => {
  class Conversation {
    public static async getConversation(selector) {
      const conversation = await models.Conversations.findOne(selector);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return conversation;
    }
  }

  conversationSchema.loadClass(Conversation);

  return conversationSchema;
};
