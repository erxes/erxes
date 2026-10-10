import type {
  DiscordActivity,
  DiscordAttachment,
  DiscordEmbed,
  DiscordPoll,
  DiscordSticker,
} from '@/integrations/discord/@types/activity';

const buildAttachmentPreview = (attachments?: DiscordAttachment[]): string => {
  if (attachments?.some((item) => item.type.startsWith('image/'))) {
    return 'Sent an image';
  }
  if (attachments?.some((item) => item.type.startsWith('video/'))) {
    return 'Sent a video';
  }
  if (attachments?.some((item) => item.type.startsWith('audio/'))) {
    return 'Sent an audio file';
  }
  if (attachments?.length) {
    return 'Sent a file';
  }
  return 'Unsupported message';
};

/** Choose concise conversation preview text for rich Discord content. */
export const buildMessagePreview = (
  displayContent: string,
  poll?: DiscordPoll,
  embeds?: DiscordEmbed[],
  attachments?: DiscordAttachment[],
  stickers?: DiscordSticker[],
  voiceMessage?: boolean,
  forwarded?: boolean,
) =>
  displayContent ||
  (poll ? poll.question || 'Poll' : '') ||
  embeds?.find((embed) => embed.title || embed.url)?.title ||
  (embeds?.length ? 'Shared a link' : '') ||
  (voiceMessage ? 'Voice message' : '') ||
  (stickers?.length ? `Sticker · ${stickers[0].name}` : '') ||
  (forwarded ? 'Forwarded a message' : '') ||
  buildAttachmentPreview(attachments);

/** Build the rich-content metadata stored with the inbox message. */
export const buildInboxMessageExtraData = (
  activity: DiscordActivity,
  stored: {
    poll?: Exclude<DiscordActivity['poll'], undefined>;
    embeds?: Exclude<DiscordActivity['embeds'], undefined>;
    stickers?: Exclude<DiscordActivity['stickers'], undefined>;
    voiceMessage?: Exclude<DiscordActivity['voiceMessage'], undefined>;
    forwardedSnapshot?: Exclude<
      DiscordActivity['forwardedSnapshot'],
      undefined
    >;
  },
) => ({
  ...(stored.poll && { poll: stored.poll }),
  ...(stored.embeds?.length && { embeds: stored.embeds }),
  ...(stored.stickers?.length && { stickers: stored.stickers }),
  ...(stored.voiceMessage && { voiceMessage: true }),
  ...(stored.forwardedSnapshot && {
    forwardedSnapshot: stored.forwardedSnapshot,
  }),
  discordMessageId: activity.messageId,
  discordPinned: Boolean(activity.raw?.pinned),
});
