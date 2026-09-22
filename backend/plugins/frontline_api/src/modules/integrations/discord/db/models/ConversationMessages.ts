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
  // skipcq: JS-0327 — Mongoose's schema.loadClass() requires a class of statics.
  class ConversationMessage {
    /** Fetch a mirrored Discord message by selector, throwing if not found. */
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
