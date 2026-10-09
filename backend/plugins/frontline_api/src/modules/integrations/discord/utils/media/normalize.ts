import type { APIEmbed, APIPoll } from 'discord-api-types/v10';

import type {
  DiscordEmbed,
  DiscordPoll,
  TDiscordMessagePayload,
} from '@/integrations/discord/@types/activity';

import { type TEmbedMedia } from '@/integrations/discord/@types/messageMedia';

/** Preserve the native sticker format; Lottie assets require a JSON renderer. */
const stickerUrl = (id: string, formatType: number) => {
  if (formatType === 3) {
    return `https://cdn.discordapp.com/stickers/${id}.json`;
  }
  const extension = formatType === 4 ? 'gif' : 'png';
  return `https://media.discordapp.net/stickers/${id}.${extension}`;
};

/** Map Discord sticker items to inbox sticker metadata. */
export const normalizeDiscordStickers = (
  stickers?: TDiscordMessagePayload['sticker_items'],
) =>
  stickers?.map((sticker) => ({
    id: sticker.id,
    name: sticker.name,
    formatType: sticker.format_type,
    url: stickerUrl(sticker.id, sticker.format_type),
  }));

/** Keep Discord attachment media details in the inbox attachment shape. */
export const normalizeDiscordAttachments = (
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

/** Convert a Discord poll to the stored poll shape. */
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
