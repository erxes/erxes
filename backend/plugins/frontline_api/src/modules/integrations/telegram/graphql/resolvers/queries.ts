import type { IContext } from '~/connectionResolvers';
import type { ITelegramBotDocument } from '@/integrations/telegram/@types/bot';
import type { ITelegramWebhook } from '@/integrations/telegram/@types/webhook';
import { getTelegramBot } from '@/integrations/telegram/client';
import { visibleChannelsFilter } from '@/channel/utils';
import { z } from 'zod';
import { getTelegramLinkPreviews } from '../../utils/linkPreview';

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
  async telegramMessageLinkPreviews(
    _root: undefined,
    { messageId }: { messageId: string },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('showConversations');
    z.string().min(1).max(200).parse(messageId);
    const message = await models.ConversationMessages.findOne({
      _id: messageId,
    });
    if (!message || message.internal) return [];
    const conversation = await models.Conversations.findOne({
      _id: message.conversationId,
    });
    if (!conversation) return [];
    const channels = await models.Channels.find(
      await visibleChannelsFilter({ models, subdomain, user }),
    ).distinct('_id');
    const integration = await models.Integrations.exists({
      _id: conversation.integrationId,
      kind: 'telegram-messenger',
      channelId: { $in: channels },
    });
    if (!integration) return [];
    return getTelegramLinkPreviews(subdomain, message.content || '');
  },
  async telegramConversationChats(
    _root: undefined,
    { conversationIds }: { conversationIds: string[] },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('showConversations');
    const ids = z.array(z.string().min(1)).max(100).parse(conversationIds);
    if (!ids.length) return [];
    const channels = await models.Channels.find(
      await visibleChannelsFilter({ models, subdomain, user }),
    ).distinct('_id');
    const integrations = await models.Integrations.find({
      kind: 'telegram-messenger',
      channelId: { $in: channels },
    }).distinct('_id');
    const chats = await models.TelegramConversations.find({
      erxesApiId: { $in: ids },
      integrationId: { $in: integrations },
    }).lean();
    return chats.map((chat) => ({ ...chat, conversationId: chat.erxesApiId }));
  },
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
