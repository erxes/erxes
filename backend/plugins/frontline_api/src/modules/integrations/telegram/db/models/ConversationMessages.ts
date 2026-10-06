import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITelegramConversationMessageDocument } from '@/integrations/telegram/@types/conversationMessages';
import { telegramConversationMessageSchema } from '@/integrations/telegram/db/definitions/conversationMessages';

export interface ITelegramConversationMessageModel extends Model<ITelegramConversationMessageDocument> {
  getMessage(
    selector: FilterQuery<ITelegramConversationMessageDocument>,
  ): Promise<ITelegramConversationMessageDocument>;
}

export const loadTelegramConversationMessageClass = (models: IModels) => {
  class TelegramConversationMessage {
    public static async getMessage(
      selector: FilterQuery<ITelegramConversationMessageDocument>,
    ): Promise<ITelegramConversationMessageDocument> {
      const message =
        await models.TelegramConversationMessages.findOne(selector);

      if (!message) {
        throw new Error('Telegram conversation message not found');
      }

      return message;
    }
  }

  telegramConversationMessageSchema.loadClass(TelegramConversationMessage);

  return telegramConversationMessageSchema;
};
