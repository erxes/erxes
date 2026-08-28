import {
  APIEmbed,
  APIEmbedImage,
  APIEmbedThumbnail,
  APIEmbedVideo,
  APIPoll,
  GatewayMessageDeleteBulkDispatchData,
  GatewayMessageDeleteDispatchData,
  GatewayMessagePollVoteDispatchData,
  GatewayMessageReactionAddDispatchData,
  GatewayMessageReactionRemoveDispatchData,
  GatewayTypingStartDispatchData,
} from 'discord-api-types/v10';
import {
  DiscordActivity,
  DiscordEmbed,
  DiscordMention,
  DiscordMessageDeleteEvent,
  DiscordPoll,
  DiscordPollVoteEvent,
  DiscordReactionEvent,
  DiscordTypingEvent,
  TDiscordMessagePayload,
} from '@/integrations/discord/@types/activity';

const DISCORD_VOICE_MESSAGE_FLAG = 1 << 13;

const stickerUrl = (id: string, formatType: number) =>
  formatType === 3
    ? undefined
    : `https://media.discordapp.net/stickers/${id}.${
        formatType === 4 ? 'gif' : 'png'
      }`;

const normalizeDiscordStickers = (
  stickers?: TDiscordMessagePayload['sticker_items'],
) =>
  stickers?.map((sticker) => ({
    id: sticker.id,
    name: sticker.name,
    formatType: sticker.format_type,
    url: stickerUrl(sticker.id, sticker.format_type),
  }));

const normalizeDiscordAttachments = (
  attachments?: TDiscordMessagePayload['attachments'],
) =>
  (attachments || []).map((attachment) => ({
    type: attachment.content_type || 'application/octet-stream',
    url: attachment.url || '',
    name: attachment.filename || '',
    size: typeof attachment.size === 'number' ? attachment.size : undefined,
    width: typeof attachment.width === 'number' ? attachment.width : undefined,
    height:
      typeof attachment.height === 'number' ? attachment.height : undefined,
    duration:
      typeof attachment.duration_secs === 'number'
        ? attachment.duration_secs
        : undefined,
    waveform: attachment.waveform || undefined,
    ephemeral: Boolean(attachment.ephemeral),
    spoiler: attachment.filename?.startsWith('SPOILER_'),
  }));

export const normalizeDiscordPoll = (
  poll?: APIPoll,
): DiscordPoll | undefined => {
  if (!poll) {
    return undefined;
  }

  return {
    question: poll.question?.text || '',
    answers: (poll.answers || []).map((answer) => ({
      id: answer.answer_id,
      text: answer.poll_media?.text || '',
      emoji: answer.poll_media?.emoji?.name || undefined,
    })),
    allowMultiselect: Boolean(poll.allow_multiselect),
    expiry: poll.expiry || undefined,
    results: poll.results
      ? {
          isFinalized: Boolean(poll.results.is_finalized),
          answerCounts: (poll.results.answer_counts || []).map((c) => ({
            id: c.id,
            count: c.count || 0,
          })),
        }
      : undefined,
  };
};

type TEmbedMedia = APIEmbedImage | APIEmbedThumbnail | APIEmbedVideo;

const embedMediaUrl = (media?: TEmbedMedia) =>
  media ? media.proxy_url || media.url || undefined : undefined;

const normalizeEmbedMedia = (media?: TEmbedMedia) =>
  media
    ? {
        url: embedMediaUrl(media),
        width: typeof media.width === 'number' ? media.width : undefined,
        height: typeof media.height === 'number' ? media.height : undefined,
      }
    : undefined;

export const normalizeDiscordEmbeds = (
  embeds?: APIEmbed[],
): DiscordEmbed[] | undefined => {
  if (!Array.isArray(embeds) || embeds.length === 0) {
    return undefined;
  }

  return embeds.map((embed) => ({
    type: embed?.type || undefined,
    title: embed?.title || undefined,
    description: embed?.description || undefined,
    url: embed?.url || undefined,
    color:
      typeof embed?.color === 'number'
        ? `#${embed.color.toString(16).padStart(6, '0')}`
        : undefined,
    author: embed?.author
      ? {
          name: embed.author.name || undefined,
          url: embed.author.url || undefined,
          iconUrl:
            embed.author.proxy_icon_url || embed.author.icon_url || undefined,
        }
      : undefined,
    provider: embed?.provider
      ? {
          name: embed.provider.name || undefined,
          url: embed.provider.url || undefined,
        }
      : undefined,
    thumbnail: normalizeEmbedMedia(embed?.thumbnail),
    image: normalizeEmbedMedia(embed?.image),
    video: normalizeEmbedMedia(embed?.video),
    fields: Array.isArray(embed?.fields)
      ? embed.fields.map((field) => ({
          name: field?.name || '',
          value: field?.value || '',
          inline: Boolean(field?.inline),
        }))
      : undefined,
    footer: embed?.footer
      ? {
          text: embed.footer.text || undefined,
          iconUrl:
            embed.footer.proxy_icon_url || embed.footer.icon_url || undefined,
        }
      : undefined,
    timestamp: embed?.timestamp || undefined,
  }));
};

export const mapMessageCreateToActivity = (
  payload: TDiscordMessagePayload,
): DiscordActivity => {
  const author = payload?.author;
  const referencedMessage = payload?.referenced_message;
  const referencedMessageId =
    referencedMessage?.id || payload?.message_reference?.message_id;
  const referencedMentions = (referencedMessage?.mentions || []).map(
    (user) => ({
      id: user?.id,
      name: user?.global_name || user?.username || user?.id,
    }),
  );
  const referencedContent = resolveDiscordMentions(
    referencedMessage?.content || '',
    referencedMentions,
  );
  const referencedAttachment = referencedMessage?.attachments?.[0];
  const replyPreview =
    referencedContent ||
    (referencedAttachment
      ? `Attachment · ${referencedAttachment.filename || 'File'}`
      : referencedMessage?.embeds?.[0]?.title || undefined);
  const snapshot = payload.message_snapshots?.[0]?.message;

  return {
    source: 'discord',
    timestamp: payload?.timestamp ? new Date(payload.timestamp) : new Date(),
    messageId: payload?.id ?? '',
    channelId: payload?.channel_id ?? '',
    guildId: payload?.guild_id,
    author: {
      id: author?.id ?? '',
      username: author?.username || author?.global_name || author?.id || '',
      bot: Boolean(author?.bot) || Boolean(payload?.webhook_id),
    },
    content: payload?.content || '',
    type: typeof payload?.type === 'number' ? payload.type : undefined,
    poll: normalizeDiscordPoll(payload?.poll),
    embeds: normalizeDiscordEmbeds(payload?.embeds),
    mentions: (payload?.mentions || []).map((user) => ({
      id: user?.id,
      name:
        user?.member?.nick || user?.global_name || user?.username || user?.id,
    })),
    attachments: normalizeDiscordAttachments(payload.attachments),
    stickers: normalizeDiscordStickers(payload.sticker_items),
    voiceMessage: Boolean((payload.flags || 0) & DISCORD_VOICE_MESSAGE_FLAG),
    ...(snapshot && {
      forwardedSnapshot: {
        content: snapshot.content || undefined,
        attachments: normalizeDiscordAttachments(snapshot.attachments),
        embeds: normalizeDiscordEmbeds(snapshot.embeds),
        stickers: normalizeDiscordStickers(snapshot.sticker_items),
        createdAt: snapshot.timestamp || undefined,
      },
    }),
    ...(referencedMessageId && {
      replyTo: {
        messageId: referencedMessageId,
        content: replyPreview,
        authorName:
          referencedMessage?.author?.global_name ||
          referencedMessage?.author?.username ||
          undefined,
      },
    }),
    raw: payload,
  };
};

const USER_MENTION_RE = /<@!?(\d+)>/g;
const ROLE_MENTION_RE = /<@&(\d+)>/g;
const CHANNEL_MENTION_RE = /<#(\d+)>/g;
const CUSTOM_EMOJI_RE = /<a?:([^:>]+):\d+>/g;
const TIMESTAMP_RE = /<t:(\d+)(?::[tTdDfFR])?>/g;

export const resolveDiscordMentions = (
  content: string,
  mentions: DiscordMention[] = [],
): string => {
  if (!content) {
    return content;
  }

  const nameById = new Map(
    mentions.map((mention) => [mention.id, mention.name]),
  );

  const resolved = content
    .replace(USER_MENTION_RE, (full, id) => {
      const name = nameById.get(id);
      return name ? `@${name}` : '@unknown-user';
    })
    .replace(ROLE_MENTION_RE, '@role')
    .replace(CHANNEL_MENTION_RE, '#channel')
    .replace(CUSTOM_EMOJI_RE, ':$1:')
    .replace(TIMESTAMP_RE, (_full, seconds) =>
      new Date(Number(seconds) * 1000).toLocaleString('en-US'),
    );

  return resolved;
};
const CONTENT_MESSAGE_TYPES = new Set([0, 19]);

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

export const mapReactionToEvent = (
  payload:
    | GatewayMessageReactionAddDispatchData
    | GatewayMessageReactionRemoveDispatchData,
  added: boolean,
): DiscordReactionEvent => ({
  source: 'discord',
  messageId: payload.message_id,
  channelId: payload.channel_id,
  userId: payload.user_id,
  emoji: payload.emoji.id
    ? `<${payload.emoji.animated ? 'a' : ''}:${payload.emoji.name || 'emoji'}:${
        payload.emoji.id
      }>`
    : payload.emoji.name || '♥',
  added,
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
