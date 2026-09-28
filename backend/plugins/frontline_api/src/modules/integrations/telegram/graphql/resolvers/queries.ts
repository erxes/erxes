import type { IContext } from '~/connectionResolvers';
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
