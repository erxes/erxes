import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { ITelegramBotDocument } from '@/integrations/telegram/@types/bot';
import { telegramBotSchema } from '@/integrations/telegram/db/definitions/bots';

export interface ITelegramBotModel extends Model<ITelegramBotDocument> {
  getBot(_id: string): Promise<ITelegramBotDocument>;
}

export const loadTelegramBotClass = (models: IModels) => {
  class TelegramBot {
    public static async getBot(_id: string): Promise<ITelegramBotDocument> {
      const bot = await models.TelegramBots.findOne({ _id });

      if (!bot) {
        throw new Error('Telegram bot not found');
      }

      return bot;
    }
  }
  return telegramBotSchema.loadClass(TelegramBot);
};
