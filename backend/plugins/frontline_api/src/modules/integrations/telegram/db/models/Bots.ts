import { randomBytes } from 'node:crypto';
import { FilterQuery, Model, mongo } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  ITelegramBotCreateInput,
  ITelegramBotDocument,
} from '@/integrations/telegram/@types/bot';
import { telegramBotSchema } from '@/integrations/telegram/db/definitions/bots';
import {
  getTelegramBot,
  getTelegramWebhookInfo,
  setTelegramWebhook,
  type TelegramWebhookInfo,
} from '@/integrations/telegram/client';
import { verifyTelegramWebhookSecret } from '@/integrations/telegram/utils/webhookAuth';

export interface ITelegramBotModel extends Model<ITelegramBotDocument> {
  getBot(_id: string): Promise<ITelegramBotDocument>;
  getWebhookInfo(_id: string): Promise<TelegramWebhookInfo>;
  setWebhook(_id: string, url: string): Promise<boolean>;
  getBots(
    filter: FilterQuery<ITelegramBotDocument>,
  ): Promise<ITelegramBotDocument[]>;
  createBot(doc: ITelegramBotCreateInput): Promise<ITelegramBotDocument>;
  verifyWebhookSecret(_id: string, receivedSecret?: string): Promise<boolean>;
  attachIntegration(
    _id: string,
    integrationId: string,
  ): Promise<ITelegramBotDocument>;
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
    public static async getWebhookInfo(
      _id: string,
    ): Promise<TelegramWebhookInfo> {
      const bot = await models.TelegramBots.findOne({ _id }).select('+token');

      if (!bot) {
        throw new Error('Telegram bot not found');
      }
      return getTelegramWebhookInfo(bot.token);
    }
    public static async setWebhook(_id: string, url: string): Promise<boolean> {
      const bot = await models.TelegramBots.findOne({ _id }).select(
        '+token +webhookSecret',
      );

      if (!bot) {
        throw new Error('Telegram bot not found');
      }

      if (!bot.erxesApiId) {
        throw new Error(
          'Connect this Telegram bot to an inbox integration first',
        );
      }

      return setTelegramWebhook(bot.token, url, bot.webhookSecret);
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
    public static async verifyWebhookSecret(
      _id: string,
      receivedSecret?: string,
    ) {
      if (!_id || !receivedSecret) {
        return false;
      }
      const bot = await models.TelegramBots.findOne({ _id }).select(
        '+webhookSecret',
      );
      if (!bot) {
        return false;
      }

      return verifyTelegramWebhookSecret(bot.webhookSecret, receivedSecret);
    }
    public static async attachIntegration(
      _id: string,
      integrationId: string,
    ): Promise<ITelegramBotDocument> {
      if (!_id || !integrationId) {
        throw new Error('Bot and Integration IDs are required');
      }

      const integration = await models.Integrations.exists({
        _id: integrationId,
        kind: 'telegram-messenger',
      });

      if (!integration) {
        throw new Error('Telegram inbox integration not found');
      }

      let bot: ITelegramBotDocument | null;

      try {
        bot = await models.TelegramBots.findOneAndUpdate(
          { _id, erxesApiId: { $exists: false } },
          { $set: { erxesApiId: integrationId } },
          { new: true, runValidators: true },
        );
      } catch (error: unknown) {
        if (
          error instanceof mongo.MongoServerError &&
          error.code === 11000 &&
          error.keyPattern?.erxesApiId === 1
        ) {
          throw new Error(
            'This inbox integration is already connected to a Telegram bot',
          );
        }

        throw new Error('Could not connect Telegram bot. Please try again.');
      }
      if (!bot) {
        await models.TelegramBots.getBot(_id);

        throw new Error(
          'This Telegram bot is already connected to an inbox integration',
        );
      }

      return bot;
    }
  }
  return telegramBotSchema.loadClass(TelegramBot);
};
