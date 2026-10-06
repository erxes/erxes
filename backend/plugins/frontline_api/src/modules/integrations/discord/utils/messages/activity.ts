import type {
  DiscordActivity,
  TDiscordMessagePayload,
} from '@/integrations/discord/@types/activity';

import { discordMention } from '@/integrations/discord/utils/messages/mentions';

import {
  resolveForwardedSnapshot,
  resolveDiscordReply,
} from '@/integrations/discord/utils/messages/references';

import {
  normalizeDiscordPoll,
  normalizeDiscordEmbeds,
  normalizeDiscordAttachments,
  normalizeDiscordStickers,
} from '@/integrations/discord/utils/media/normalize';
import { DISCORD_VOICE_MESSAGE_FLAG } from '@/integrations/discord/constants/messages';

import { CONTENT_MESSAGE_TYPES } from '@/integrations/discord/constants/messages';

/** Map the Discord author into an activity author. */
const resolveActivityAuthor = (payload: TDiscordMessagePayload) => {
  const author = payload.author;
  return {
    id: author?.id ?? '',
    username: author?.username || author?.global_name || author?.id || '',
    bot: Boolean(author?.bot) || Boolean(payload.webhook_id),
  };
};

/** Use the Discord timestamp or the current time for an activity. */
const resolveActivityTimestamp = (payload: TDiscordMessagePayload) =>
  payload.timestamp ? new Date(payload.timestamp) : new Date();

/** Read the Discord message type when present. */
const resolveActivityType = (payload: TDiscordMessagePayload) =>
  typeof payload.type === 'number' ? payload.type : undefined;

/** Map mentioned Discord users into activity mentions. */
const resolveActivityMentions = (payload: TDiscordMessagePayload) =>
  (payload.mentions || []).map(discordMention);

/** Convert a Discord message event into the inbox activity shape. */
export const mapMessageCreateToActivity = (
  payload: TDiscordMessagePayload,
): DiscordActivity => {
  const forwardedSnapshot = resolveForwardedSnapshot(payload);
  const replyTo = resolveDiscordReply(payload);

  return {
    source: 'discord',
    timestamp: resolveActivityTimestamp(payload),
    messageId: payload.id ?? '',
    channelId: payload.channel_id ?? '',
    guildId: payload.guild_id,
    author: resolveActivityAuthor(payload),
    content: payload.content || '',
    type: resolveActivityType(payload),
    poll: normalizeDiscordPoll(payload.poll),
    embeds: normalizeDiscordEmbeds(payload.embeds),
    mentions: resolveActivityMentions(payload),
    attachments: normalizeDiscordAttachments(payload.attachments),
    stickers: normalizeDiscordStickers(payload.sticker_items),
    voiceMessage: Boolean((payload.flags || 0) & DISCORD_VOICE_MESSAGE_FLAG),
    ...(forwardedSnapshot && { forwardedSnapshot }),
    ...(replyTo && { replyTo }),
    raw: payload,
  };
};

export const isIgnorableActivity = (
  activity: DiscordActivity,
  { allowBotAuthor = false }: { allowBotAuthor?: boolean } = {},
): boolean => {
  return (
    (!allowBotAuthor && activity.author.bot) ||
    !activity.messageId ||
    !activity.channelId ||
    (typeof activity.type === 'number' &&
      !CONTENT_MESSAGE_TYPES.has(activity.type))
  );
};
