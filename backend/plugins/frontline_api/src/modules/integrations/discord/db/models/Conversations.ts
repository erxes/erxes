import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { conversationSchema } from '@/integrations/discord/db/definitions/conversations';
import { IDiscordConversationDocument } from '@/integrations/discord/@types/conversations';

export interface IDiscordConversationModel
  extends Model<IDiscordConversationDocument> {
  getConversation(
    selector: FilterQuery<IDiscordConversationDocument>,
  ): Promise<IDiscordConversationDocument>;
}

export const loadDiscordConversationClass = (models: IModels) => {
  class Conversation {
    public static async getConversation(
      selector: FilterQuery<IDiscordConversationDocument>,
    ) {
      const conversation = await models.DiscordConversations.findOne(selector);

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      return conversation;
    }
  }

  conversationSchema.loadClass(Conversation);

  return conversationSchema;
};
