import type { TDiscordMessagePayload } from '@/integrations/discord/@types/activity';
import {
  discordMention,
  resolveDiscordMentions,
} from '@/integrations/discord/utils/messages/mentions';
import {
  normalizeDiscordAttachments,
  normalizeDiscordEmbeds,
  normalizeDiscordStickers,
} from '@/integrations/discord/utils/media/normalize';

/** Find the Discord message referenced by a reply. */
const referencedMessageIdOf = (payload: TDiscordMessagePayload) =>
  payload.referenced_message?.id || payload.message_reference?.message_id;

/** Build a short preview of the message being replied to. */
const referencedMessagePreview = (payload: TDiscordMessagePayload) => {
  const referenced = payload.referenced_message;
  const mentions = (referenced?.mentions || []).map(discordMention);
  const content = resolveDiscordMentions(referenced?.content || '', mentions);
  if (content) return content;
  const attachment = referenced?.attachments?.[0];
  if (attachment) return `Attachment · ${attachment.filename || 'File'}`;
  return referenced?.embeds?.[0]?.title || undefined;
};

/** Find the display name of the author being replied to. */
const referencedAuthorName = (payload: TDiscordMessagePayload) => {
  const author = payload.referenced_message?.author;
  return author?.global_name || author?.username || undefined;
};

/** Extract reply context while excluding native forwards. */
export const resolveDiscordReply = (payload: TDiscordMessagePayload) => {
  if (
    payload.message_reference?.type === 1 ||
    payload.message_snapshots?.length
  ) {
    return undefined;
  }

  const referencedMessageId = referencedMessageIdOf(payload);
  if (!referencedMessageId) return undefined;
  return {
    messageId: referencedMessageId,
    content: referencedMessagePreview(payload),
    authorName: referencedAuthorName(payload),
  };
};

/** Extract the original content carried by a Discord forward. */
export const resolveForwardedSnapshot = (payload: TDiscordMessagePayload) => {
  const snapshot = payload.message_snapshots?.[0]?.message;
  if (!snapshot) return undefined;
  const mentions = (snapshot.mentions || []).map(discordMention);

  return {
    content:
      resolveDiscordMentions(snapshot.content || '', mentions) || undefined,
    attachments: normalizeDiscordAttachments(snapshot.attachments),
    embeds: normalizeDiscordEmbeds(snapshot.embeds),
    stickers: normalizeDiscordStickers(snapshot.sticker_items),
    createdAt: snapshot.timestamp || undefined,
  };
};
