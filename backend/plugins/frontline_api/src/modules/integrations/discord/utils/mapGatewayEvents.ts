import type {
  GatewayMessageDeleteBulkDispatchData,
  GatewayMessageDeleteDispatchData,
  GatewayMessagePollVoteDispatchData,
  GatewayMessageReactionAddDispatchData,
  GatewayMessageReactionRemoveDispatchData,
  GatewayMessageReactionRemoveAllDispatchData,
  GatewayMessageReactionRemoveEmojiDispatchData,
  GatewayTypingStartDispatchData,
} from 'discord-api-types/v10';
import type {
  DiscordMessageDeleteEvent,
  DiscordPollVoteEvent,
  DiscordReactionEvent,
  DiscordReactionClearEvent,
  DiscordTypingEvent,
} from '@/integrations/discord/@types/activity';

export const mapPollVoteToEvent = (
  payload: GatewayMessagePollVoteDispatchData,
  added: boolean,
): DiscordPollVoteEvent => ({
  source: 'discord',
  messageId: payload?.message_id,
  channelId: payload?.channel_id,
  guildId: payload?.guild_id,
  userId: payload?.user_id,
  answerId: payload?.answer_id,
  added,
  raw: payload,
});

const reactionEmoji = (
  emoji: GatewayMessageReactionAddDispatchData['emoji'],
): string => {
  const animatedPrefix = emoji.animated ? 'a' : '';
  const emojiName = emoji.name || 'emoji';
  return emoji.id
    ? `<${animatedPrefix}:${emojiName}:${emoji.id}>`
    : emoji.name || '♥';
};

/** Convert a gateway reaction event into an inbox reaction event. */
export const mapReactionToEvent = (
  payload:
    | GatewayMessageReactionAddDispatchData
    | GatewayMessageReactionRemoveDispatchData,
  added: boolean,
): DiscordReactionEvent => {
  return {
    source: 'discord',
    messageId: payload.message_id,
    channelId: payload.channel_id,
    userId: payload.user_id,
    emoji: reactionEmoji(payload.emoji),
    added,
    raw: payload,
  };
};

export const mapReactionClearToEvent = (
  payload:
    | GatewayMessageReactionRemoveAllDispatchData
    | GatewayMessageReactionRemoveEmojiDispatchData,
): DiscordReactionClearEvent => ({
  source: 'discord',
  messageId: payload.message_id,
  channelId: payload.channel_id,
  ...('emoji' in payload && { emoji: reactionEmoji(payload.emoji) }),
  raw: payload,
});

export const mapTypingStartToEvent = (
  payload: GatewayTypingStartDispatchData,
): DiscordTypingEvent => {
  const user = payload?.member?.user;

  return {
    source: 'discord',
    channelId: payload?.channel_id,
    guildId: payload?.guild_id,
    userId: payload?.user_id,
    username:
      payload?.member?.nick || user?.global_name || user?.username || undefined,
    bot: Boolean(user?.bot),
    timestamp: payload?.timestamp
      ? new Date(payload.timestamp * 1000)
      : new Date(),
  };
};

export const mapMessageDeleteToEvent = (
  payload:
    | GatewayMessageDeleteDispatchData
    | GatewayMessageDeleteBulkDispatchData,
): DiscordMessageDeleteEvent => {
  const ids =
    'ids' in payload
      ? payload.ids
      : [(payload as GatewayMessageDeleteDispatchData).id];

  return {
    source: 'discord',
    messageIds: (ids || []).filter(Boolean),
    channelId: payload?.channel_id,
    guildId: payload?.guild_id,
  };
};
