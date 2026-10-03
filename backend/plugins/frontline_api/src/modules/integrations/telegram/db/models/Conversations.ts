import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITelegramConversationDocument } from '@/integrations/telegram/@types/conversations';
import { telegramConversationSchema } from '@/integrations/telegram/db/definitions/conversations';

export interface ITelegramConversationModel
  extends Model<ITelegramConversationDocument> {
  getConversation(
    selector: FilterQuery<ITelegramConversationDocument>,
  ): Promise<ITelegramConversationDocument>;
}

export const loadTelegramConversationClass = (models: IModels) => {
  class TelegramConversation {
    public static async getConversation(
      selector: FilterQuery<ITelegramConversationDocument>,
    ): Promise<ITelegramConversationDocument> {
      const conversation = await models.TelegramConversations.findOne(selector);

      if (!conversation) {
        throw new Error('Telegram conversation not found');
      }

      return conversation;
    }
  }

  telegramConversationSchema.loadClass(TelegramConversation);

  return telegramConversationSchema;
};
