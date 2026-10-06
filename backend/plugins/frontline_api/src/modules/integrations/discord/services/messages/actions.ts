import type { IModels } from '~/connectionResolvers';

import { DiscordApiError } from '@/integrations/discord/errors/DiscordApiError';

import {
  addChannelMessageReaction,
  removeChannelMessageReaction,
  pinChannelMessage,
  unpinChannelMessage,
} from '@/integrations/discord/utils/outbound/actions';

import {
  buildDiscordReactionUpdate,
  publishDiscordMessage,
} from '@/integrations/discord/services/messages/events';

import { type TInboxRelayDoc } from '@/integrations/discord/@types/inboxRelay';

import { DISCORD_REACTION_EMOJI } from '@/integrations/discord/constants/reactions';

/** Apply an inbox reaction action in Discord and the inbox. */
export const handleDiscordReaction = async (
  models: IModels,
  doc: TInboxRelayDoc,
) => {
  const { integrationId, conversationId, messageId, reaction, remove, userId } =
    doc;
  if (!messageId || !reaction) {
    throw new Error('Message id and reaction are required');
  }
  const conversation = await models.DiscordConversations.findOne({
    erxesApiId: conversationId,
  });
  const bot = await models.DiscordBots.findOne({
    erxesApiId: integrationId,
  }).sort({ createdAt: -1 });
  if (!conversation?.channelId || !bot?.token) {
    throw new Error('Discord conversation is unavailable');
  }
  const messageFilter = {
    conversationId,
    'extraData.discordMessageId': messageId,
  };
  if (!(await models.ConversationMessages.exists(messageFilter))) {
    throw new Error('Message not found in this Discord conversation');
  }
  const emoji = DISCORD_REACTION_EMOJI[reaction] || reaction;
  const discordEmoji = emoji.replace(/^<a?:([^:>]+):(\d+)>$/, '$1:$2');
  const updateReaction = remove
    ? removeChannelMessageReaction
    : addChannelMessageReaction;
  // Agents share a bot identity in Discord; keep its reaction while another
  // agent still owns this emoji in the inbox.
  const hasOtherAgentReaction =
    remove &&
    (await models.ConversationMessages.exists({
      ...messageFilter,
      'extraData.reactions': {
        $elemMatch: {
          emoji,
          reaction: { $exists: true },
          senderId: { $ne: userId || 'agent' },
        },
      },
    }));
  if (!hasOtherAgentReaction) {
    await updateReaction(
      bot.token,
      conversation.channelId,
      messageId,
      discordEmoji,
    );
  }

  const inboxMessage = await models.ConversationMessages.findOneAndUpdate(
    messageFilter,
    buildDiscordReactionUpdate({
      senderId: userId || 'agent',
      botId: bot.applicationId,
      emoji,
      reaction,
      remove: Boolean(remove),
    }),
    { new: true },
  );
  if (!inboxMessage) {
    throw new Error('Message not found in this Discord conversation');
  }
  return { status: 'success', data: inboxMessage.toObject() };
};

/** Apply a Discord pin action and mirror its state in the inbox. */
export const handleDiscordPinMessenger = async (
  models: IModels,
  doc: TInboxRelayDoc,
  subdomain: string,
) => {
  const { integrationId, conversationId, messageId, remove } = doc;
  if (!messageId) {
    throw new Error('Message id is required');
  }
  const conversation = await models.DiscordConversations.findOne({
    erxesApiId: conversationId,
  });
  const bot = await models.DiscordBots.findOne({
    erxesApiId: integrationId,
  }).sort({ createdAt: -1 });
  if (!conversation?.channelId || !bot?.token) {
    throw new Error('Discord conversation is unavailable');
  }

  const updatePin = remove ? unpinChannelMessage : pinChannelMessage;
  const messageFilter = {
    conversationId,
    'extraData.discordMessageId': messageId,
  };
  if (!(await models.ConversationMessages.exists(messageFilter))) {
    throw new Error('Message not found in this Discord conversation');
  }
  try {
    await updatePin(bot.token, conversation.channelId, messageId);
  } catch (error) {
    if (error instanceof DiscordApiError && error.status === 403) {
      throw new Error(
        'The Discord bot needs the "Pin Messages" permission in this channel to pin messages. Re-authorize the bot or update the channel role override, then try again.',
      );
    }
    if (error instanceof DiscordApiError && error.status === 404) {
      throw new Error('This message no longer exists in the Discord channel');
    }
    throw error;
  }

  const inboxMessage = await models.ConversationMessages.findOneAndUpdate(
    messageFilter,
    { $set: { 'extraData.discordPinned': !remove } },
    { new: true },
  );
  if (inboxMessage) {
    await publishDiscordMessage(
      inboxMessage.conversationId,
      inboxMessage.toObject(),
      subdomain,
    );
  }

  return { status: 'success', pinned: !remove };
};
