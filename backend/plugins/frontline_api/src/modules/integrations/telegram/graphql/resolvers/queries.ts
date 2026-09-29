import type { IContext } from '~/connectionResolvers';
import type { ITelegramBotDocument } from '@/integrations/telegram/@types/bot';
import { getTelegramBot } from '@/integrations/telegram/client';

type TelegramTokenValidationResult =
  | {
      valid: true;
      botId: string;
      botUsername?: string;
      botName: string;
      canJoinGroups?: boolean;
      canReadAllGroupMessages?: boolean;
    }
  | {
      valid: false;
      error: string;
    };

export const telegramQueries = {
  async telegramBots(
    _root: undefined,
    _args: unknown,
    { models, checkPermission }: IContext,
  ): Promise<ITelegramBotDocument[]> {
    await checkPermission('showIntegrations');

    return models.TelegramBots.getBots({});
  },

  async telegramBot(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ): Promise<ITelegramBotDocument> {
    await checkPermission('showIntegrations');

    return models.TelegramBots.getBot(_id);
  },
  async telegramValidateToken(
    _root: undefined,
    { token }: { token: string },
    { checkPermission }: IContext,
  ): Promise<TelegramTokenValidationResult> {
    await checkPermission('integrationsAdd');

    try {
      const bot = await getTelegramBot(token);

      return {
        valid: true,
        botId: String(bot.id),
        botUsername: bot.username,
        botName: bot.first_name,
        canJoinGroups: bot.can_join_groups,
        canReadAllGroupMessages: bot.can_read_all_group_messages,
      };
    } catch (error: unknown) {
      return {
        valid: false,
        error:
          error instanceof Error
            ? error.message
            : 'Could not validate Telegram bot. Please try again',
      };
    }
  },
};
