import type { IContext } from '~/connectionResolvers';
import type { ITelegramBotDocument } from '@/integrations/telegram/@types/bot';
import type { ITelegramWebhook } from '@/integrations/telegram/@types/webhook';
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
  async telegramBotWebhookInfo(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ): Promise<ITelegramWebhook> {
    await checkPermission('integrationsEdit');

    const info = await models.TelegramBots.getWebhookInfo(_id);

    return {
      url: info.url,
      hasCustomCertificate: info.has_custom_certificate,
      pendingUpdateCount: info.pending_update_count,
      ipAddress: info.ip_address,
      lastErrorDate:
        info.last_error_date === undefined
          ? undefined
          : new Date(info.last_error_date * 1000),
      lastErrorMessage: info.last_error_message,
      lastSynchronizationErrorDate:
        info.last_synchronization_error_date === undefined
          ? undefined
          : new Date(info.last_synchronization_error_date * 1000),
      maxConnections: info.max_connections,
      allowedUpdates: info.allowed_updates,
    };
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
