import {
  APIEmbed,
  APIEmbedImage,
  APIEmbedThumbnail,
  APIEmbedVideo,
  APIPoll,
  GatewayMessageDeleteBulkDispatchData,
  GatewayMessageDeleteDispatchData,
  GatewayMessagePollVoteDispatchData,
  GatewayTypingStartDispatchData,
} from 'discord-api-types/v10';
import {
  DiscordActivity,
  DiscordAttachment,
  DiscordEmbed,
  DiscordMention,
  DiscordMessageDeleteEvent,
  DiscordPoll,
  DiscordPollVoteEvent,
  DiscordSticker,
  DiscordTypingEvent,
  TDiscordMessagePayload,
} from '@/integrations/discord/@types/activity';
import type {
  IMessageProviderData,
  IMessageReplyTo,
  MessageDeliveryStatus,
  MessageKind,
} from '@/inbox/@types/conversationMessages';

const DISCORD_VOICE_MESSAGE_FLAG = 1 << 13;

const stickerUrl = (id: string, formatType: number) => {
  if (formatType === 3) {
    return undefined;
  }

  return `https://media.discordapp.net/stickers/${id}.${
    formatType === 4 ? 'gif' : 'png'
  }`;
};

export const normalizeDiscordStickers = (
  stickers?: TDiscordMessagePayload['sticker_items'],
): DiscordSticker[] | undefined =>
  stickers?.map((sticker) => ({
    id: sticker.id,
    name: sticker.name,
    formatType: sticker.format_type,
    url: stickerUrl(sticker.id, sticker.format_type),
  }));

export const normalizeDiscordAttachments = (
  attachments?: TDiscordMessagePayload['attachments'],
): DiscordAttachment[] =>
  (attachments || []).map((attachment) => ({
    type: attachment.content_type || 'application/octet-stream',
    url: attachment.url || '',
    name: attachment.filename || '',
    size: typeof attachment.size === 'number' ? attachment.size : undefined,
    duration:
      typeof attachment.duration_secs === 'number'
        ? attachment.duration_secs
        : undefined,
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

const discordMention = (
  user: NonNullable<TDiscordMessagePayload['mentions']>[number],
) => ({
  id: user.id,
  name: user.member?.nick || user.global_name || user.username || user.id,
});

const USER_MENTION_RE = /<@!?(\d+)>/g;

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

  return content.replace(USER_MENTION_RE, (full, id) => {
    const name = nameById.get(id);
    return name ? `@${name}` : full;
  });
};

const resolveDiscordReply = (
  payload: TDiscordMessagePayload,
): IMessageReplyTo | undefined => {
  if (payload.message_reference?.type === 1) {
    return undefined;
  }

  const messageId =
    payload.referenced_message?.id || payload.message_reference?.message_id;
  if (!messageId) {
    return undefined;
  }

  const referenced = payload.referenced_message;
  const content = resolveDiscordMentions(
    referenced?.content || '',
    (referenced?.mentions || []).map(discordMention),
  );
  const attachmentName = referenced?.attachments?.[0]?.filename;
  const author = referenced?.author;

  return {
    messageId,
    content:
      content ||
      (attachmentName ? `Attachment: ${attachmentName}` : undefined) ||
      referenced?.embeds?.[0]?.title ||
      undefined,
    authorName: author?.global_name || author?.username || undefined,
  };
};

type TDiscordMessageNormalizationInput = {
  messageId?: string;
  type?: number;
  content?: string;
  attachments?: DiscordAttachment[];
  embeds?: DiscordEmbed[];
  stickers?: DiscordSticker[];
  voiceMessage?: boolean;
  poll?: DiscordPoll;
  replyTo?: IMessageReplyTo;
};

export type TDiscordMessageMetadata = {
  messageKind: MessageKind;
  providerData: IMessageProviderData;
  replyTo?: IMessageReplyTo;
  deliveryStatus: MessageDeliveryStatus;
};

export const normalizeDiscordMessageMetadata = (
  message: TDiscordMessageNormalizationInput,
  deliveryStatus: MessageDeliveryStatus,
): TDiscordMessageMetadata => {
  const attachment = message.attachments?.[0];
  const attachmentType = attachment?.type.toLowerCase();
  const sticker = message.stickers?.[0];
  const embed = message.embeds?.[0];
  let messageKind: MessageKind;

  if (message.voiceMessage) {
    messageKind = 'voice';
  } else if (sticker) {
    messageKind = 'sticker';
  } else if (attachmentType?.startsWith('image/')) {
    messageKind = 'image';
  } else if (attachmentType?.startsWith('video/')) {
    messageKind = 'video';
  } else if (attachmentType?.startsWith('audio/')) {
    messageKind = 'audio';
  } else if (attachment) {
    messageKind = 'file';
  } else if (embed) {
    messageKind = 'share';
  } else if (message.content?.trim()) {
    messageKind = 'text';
  } else {
    messageKind = 'unsupported';
  }

  const providerData: IMessageProviderData = {
    messageId: message.messageId,
    attachmentType:
      attachmentType ||
      (sticker ? 'sticker' : undefined) ||
      (embed ? embed.type || 'embed' : undefined),
    previewText:
      sticker?.name || embed?.title || embed?.description || attachment?.name,
    previewUrl:
      sticker?.url ||
      embed?.url ||
      embed?.image?.url ||
      embed?.video?.url ||
      embed?.thumbnail?.url ||
      attachment?.url,
    fallbackReason:
      messageKind === 'unsupported'
        ? message.poll
          ? 'Discord poll'
          : typeof message.type === 'number'
            ? `Unsupported Discord message type ${message.type}`
            : 'Unsupported Discord message'
        : undefined,
  };

  return {
    messageKind,
    providerData,
    replyTo: message.replyTo,
    deliveryStatus,
  };
};

export const mapMessageCreateToActivity = (
  payload: TDiscordMessagePayload,
): DiscordActivity => {
  const author = payload?.author;

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
    mentions: (payload?.mentions || []).map(discordMention),
    attachments: normalizeDiscordAttachments(payload?.attachments),
    stickers: normalizeDiscordStickers(payload?.sticker_items),
    voiceMessage: Boolean((payload?.flags || 0) & DISCORD_VOICE_MESSAGE_FLAG),
    replyTo: resolveDiscordReply(payload),
    raw: payload,
  };
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
