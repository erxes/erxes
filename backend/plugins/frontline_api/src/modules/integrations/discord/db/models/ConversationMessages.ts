import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { conversationMessageSchema } from '@/integrations/discord/db/definitions/conversationMessages';
import { IDiscordConversationMessageDocument } from '@/integrations/discord/@types/conversationMessages';

export interface IDiscordConversationMessageModel
  extends Model<IDiscordConversationMessageDocument> {
  getMessage(
    selector: FilterQuery<IDiscordConversationMessageDocument>,
  ): Promise<IDiscordConversationMessageDocument>;
}

export const loadDiscordConversationMessageClass = (models: IModels) => {
  class ConversationMessage {
    public static async getMessage(
      selector: FilterQuery<IDiscordConversationMessageDocument>,
    ) {
      const message = await models.DiscordConversationMessages.findOne(
        selector,
      );

      if (!message) {
        throw new Error('Conversation message not found');
      }

      return message;
    }
  }

  conversationMessageSchema.loadClass(ConversationMessage);

  return conversationMessageSchema;
};
