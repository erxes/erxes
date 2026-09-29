import { randomBytes } from 'node:crypto';
import { FilterQuery, Model, mongo } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ITelegramBotCreateInput,
  ITelegramBotDocument,
} from '@/integrations/telegram/@types/bot';
import { telegramBotSchema } from '@/integrations/telegram/db/definitions/bots';
import { getTelegramBot } from '@/integrations/telegram/client';

export interface ITelegramBotModel extends Model<ITelegramBotDocument> {
  getBot(_id: string): Promise<ITelegramBotDocument>;
  getBots(
    filter: FilterQuery<ITelegramBotDocument>,
  ): Promise<ITelegramBotDocument[]>;
  createBot(doc: ITelegramBotCreateInput): Promise<ITelegramBotDocument>;
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
    public static getBots(
      filter: FilterQuery<ITelegramBotDocument>,
    ): Promise<ITelegramBotDocument[]> {
      return models.TelegramBots.find(filter).sort({ createdAt: -1 }).exec();
    }
    public static async createBot({
      token,
      createdBy,
    }: ITelegramBotCreateInput): Promise<ITelegramBotDocument> {
      if (!createdBy) {
        throw new Error('A creator is required to save a Telegram bot');
      }

      const telegramBot = await getTelegramBot(token);
      let bot: ITelegramBotDocument;

      try {
        bot = await models.TelegramBots.create({
          botId: String(telegramBot.id),
          botUsername: telegramBot.username,
          botName: telegramBot.first_name,
          token,
          webhookSecret: randomBytes(32).toString('hex'),
          canJoinGroups: telegramBot.can_join_groups,
          canReadAllGroupMessages: telegramBot.can_read_all_group_messages,
          lastVerifiedAt: new Date(),
          createdBy,
        });
      } catch (error: unknown) {
        if (
          error instanceof mongo.MongoServerError &&
          error.code === 11000 &&
          error.keyPattern?.botId === 1
        ) {
          throw new Error(
            'This Telegram bot is already saved in this workspace',
          );
        }
        throw new Error('Could not save Telegram bot. Please try again.');
      }

      return models.TelegramBots.getBot(bot._id);
    }
  }
  return telegramBotSchema.loadClass(TelegramBot);
};
