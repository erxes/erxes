import type { IModels } from '~/connectionResolvers';
import { getErrorMessage } from '@/integrations/discord/utils/request';
import {
  startTypingIndicator,
  stopTypingIndicator,
} from '@/integrations/discord/utils/typing';
import { debugError } from '@/integrations/discord/debuggers';
import { type TInboxRelayDoc } from '@/integrations/discord/@types/inboxRelay';

export const handleDiscordTypingRelay = async (
  models: IModels,
  doc: TInboxRelayDoc,
) => {
  try {
    const { integrationId, conversationId, typing = true } = doc;

    const conversation = await models.DiscordConversations.findOne({
      erxesApiId: conversationId,
    });
    if (!conversation?.channelId) {
      return { status: 'success' };
    }

    if (!typing) {
      stopTypingIndicator(conversation.channelId);
      return { status: 'success' };
    }

    const bot = await models.DiscordBots.findOne({
      erxesApiId: integrationId,
    }).sort({ createdAt: -1 });
    if (bot?.token) {
      startTypingIndicator(bot.token, conversation.channelId);
    }
  } catch (e) {
    debugError(`Failed to relay Discord agent typing: ${getErrorMessage(e)}`);
  }

  return { status: 'success' };
};
