import { IModels } from '~/connectionResolvers';
import { getErrorMessage } from '@/integrations/discord/utils/request';
import { openDmChannel } from '@/integrations/discord/utils/bot';
import { IDiscordConversationDocument } from '@/integrations/discord/@types/conversations';
import { TDiscordTriggerTarget } from '@/integrations/discord/meta/automation/types';
import { debugError } from '@/integrations/discord/debuggers';
import { type TReceiveActionInput } from '@/integrations/discord/@types/automationMessage';

// Finds the inbox conversation to mirror a channel-target reply into. There's
// exactly one conversation per Discord channel, so the match is unambiguous;
// scoped to the sending bot's integration and to synced rows so the mirror
// always has an `erxesApiId` to publish against. Returns null when the channel
// has no inbox conversation yet (the message still goes out to Discord).
const resolveChannelMirror = (
  models: IModels,
  channelId: string,
  integrationId?: string,
): Promise<IDiscordConversationDocument | null> => {
  if (!channelId || !integrationId) {
    return Promise.resolve(null);
  }

  return models.DiscordConversations.findOne({
    channelId: { $eq: channelId },
    integrationId,
    erxesApiId: { $nin: [null, ''] },
  }).exec();
};

/**
 * Resolves the sending bot/channel/conversation-to-mirror for the
 * 'conversation' target: reply into the triggering conversation's channel.
 * Prefers the Discord-side mirror's bot/channel; a reused/stale inbox
 * conversation (e.g. one left over after a bot was reconnected) may have no
 * live mirror, so falls back to the inbox conversation's integration to find
 * the bot, and to the bot's configured channel if the mirror has none.
 */
export const resolveConversationTarget = async (
  models: IModels,
  execution: TReceiveActionInput['execution'],
) => {
  // The execution's target is transported as an untyped record; for the
  // Discord message trigger it carries a TDiscordTriggerTarget.
  const conversationErxesApiId = (
    execution?.target as Partial<TDiscordTriggerTarget> | undefined
  )?.conversationId;

  if (
    typeof conversationErxesApiId !== 'string' ||
    !conversationErxesApiId.trim()
  ) {
    throw new Error('Conversation target requires a conversation ID');
  }

  const conversation = await models.DiscordConversations.findOne({
    erxesApiId: conversationErxesApiId,
  });

  // Resolve the sending bot from the integration that owns this conversation.
  // Prefer the mirror's integrationId; if the mirror is missing or its
  // integration is stale, fall back to the inbox conversation's integration.
  let integrationId: string | undefined = conversation?.integrationId;
  if (!integrationId && conversationErxesApiId) {
    integrationId = (
      await models.Conversations.findOne({ _id: conversationErxesApiId })
    )?.integrationId;
  }

  const bot = integrationId
    ? await models.DiscordBots.findOne({ erxesApiId: integrationId })
    : null;

  if (!bot) {
    throw new Error(
      'No connected Discord bot for this conversation — its integration may have been removed. Reconnect the bot, or use a Channel/DM target with an explicit bot.',
    );
  }

  // The mirror knows the exact channel/thread the message came from; without
  // it, fall back to the bot's configured channel.
  const channelId = conversation?.channelId || bot.channelId;
  if (!channelId) {
    throw new Error(
      'Could not resolve a Discord channel for this conversation',
    );
  }

  return { token: bot.token, channelId, conversation };
};

/**
 * Resolves the sending bot/channel for the 'channel' and 'dm' targets: an
 * explicitly chosen bot, plus either an explicit channel or a DM opened with
 * a chosen user. For 'channel', also resolves the channel's existing inbox
 * conversation to mirror into, if there's an unambiguous one.
 */
export const resolveChannelOrDmTarget = async (
  models: IModels,
  target: 'channel' | 'dm',
  resolved: Record<string, unknown>,
) => {
  const bot = resolved.botId
    ? await models.DiscordBots.findById(resolved.botId)
    : null;

  if (!bot) {
    throw new Error('Select a Discord bot to send this message from');
  }

  const token = bot.token;

  if (target === 'dm') {
    // `resolved` comes from placeholder substitution over an untyped record —
    // guard the type rather than coercing, so a non-string value can't silently
    // stringify to "[object Object]".
    const userId = (
      typeof resolved.userId === 'string' ? resolved.userId : ''
    ).trim();
    if (!userId) {
      throw new Error('Direct message requires a Discord user ID');
    }

    let channelId: string;
    try {
      const dm = await openDmChannel(token, userId);
      channelId = dm?.id;
    } catch (e) {
      debugError(`Failed to open Discord DM channel: ${getErrorMessage(e)}`);
      throw e;
    }
    if (!channelId) {
      throw new Error('Could not open a DM channel with that user');
    }

    return {
      token,
      channelId,
      conversation: null as IDiscordConversationDocument | null,
    };
  }

  const channelId = (
    typeof resolved.channelId === 'string' ? resolved.channelId : ''
  ).trim();
  if (!channelId) {
    throw new Error('Select a channel to send this message to');
  }

  // If this channel already has an inbox conversation, mirror the outbound
  // reply into it — so a channel-target send (e.g. an AI Agent replying into
  // the same channel it was triggered from) shows up in the inbox thread and
  // enters AI history, exactly like the conversation target. Left unmirrored
  // when there's no conversation or the channel is split across several.
  const conversation = await resolveChannelMirror(
    models,
    channelId,
    bot.erxesApiId,
  );

  return { token, channelId, conversation };
};
