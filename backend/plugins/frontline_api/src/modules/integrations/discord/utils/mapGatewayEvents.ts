import type {
  GatewayMessageDeleteBulkDispatchData,
  GatewayMessageDeleteDispatchData,
  GatewayMessagePollVoteDispatchData,
  GatewayMessageReactionAddDispatchData,
  GatewayMessageReactionRemoveDispatchData,
  GatewayTypingStartDispatchData,
} from 'discord-api-types/v10';
import type {
  DiscordMessageDeleteEvent,
  DiscordPollVoteEvent,
  DiscordReactionEvent,
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

/** Convert a gateway reaction event into an inbox reaction event. */
export const mapReactionToEvent = (
  payload:
    | GatewayMessageReactionAddDispatchData
    | GatewayMessageReactionRemoveDispatchData,
  added: boolean,
): DiscordReactionEvent => {
  const animatedPrefix = payload.emoji.animated ? 'a' : '';
  const emojiName = payload.emoji.name || 'emoji';
  return {
    source: 'discord',
    messageId: payload.message_id,
    channelId: payload.channel_id,
    userId: payload.user_id,
    emoji: payload.emoji.id
      ? `<${animatedPrefix}:${emojiName}:${payload.emoji.id}>`
      : payload.emoji.name || '♥',
    added,
    raw: payload,
  };
};

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
