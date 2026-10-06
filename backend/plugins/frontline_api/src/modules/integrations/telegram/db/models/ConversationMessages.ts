import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITelegramConversationMessageDocument } from '@/integrations/telegram/@types/conversationMessages';
import { telegramConversationMessageSchema } from '@/integrations/telegram/db/definitions/conversationMessages';

export interface ITelegramConversationMessageModel
  extends Model<ITelegramConversationMessageDocument> {
  getMessage(
    selector: FilterQuery<ITelegramConversationMessageDocument>,
  ): Promise<ITelegramConversationMessageDocument>;
}

/** Registers tenant-scoped provider message lookup methods. */
export const loadTelegramConversationMessageClass = (models: IModels) => {
  /** Loads provider message mappings needed for deduplication and synchronization. */
  class TelegramConversationMessage {
    /** Returns a matching provider message or reports a missing mapping. */
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
