import { stripHtml, type IAttachment } from 'erxes-ui';
import type { IMessage } from '@/inbox/types/Conversation';
import { stripForwardedMarkers } from '@/inbox/conversation-messages/utils/messageActionText';
import { ATTACHMENT_PLACEHOLDER_TEXTS } from '@/inbox/constants/messengerConstants';

const SOCIAL_SHARE_TYPES = new Set(['share', 'ig_post', 'ig_reel']);

const attachmentFallbackName = (type?: string) => {
  if (type === 'ig_post') return 'Instagram post';
  if (type === 'ig_reel') return 'Instagram reel';
  if (type === 'share') return 'Shared post';
  return 'Attachment';
};

const uniqueAttachments = (attachments: IMessage['attachments'] = []) => {
  const seenUrls = new Set<string>();

  return attachments.filter((attachment) => {
    if (!attachment.url) return true;
    const normalizedUrl = attachment.url.split(/[?#]/, 1)[0];
    if (seenUrls.has(normalizedUrl)) return false;
    seenUrls.add(normalizedUrl);
    return true;
  });
};

const forwardedContentText = (
  content: string | undefined,
  hasAttachments: boolean,
) => {
  const text = stripHtml(content)
    .replace(/^(?:(?:↪\s*)?Forwarded(?: message)?\s*)+/i, '')
    .trim();

  return hasAttachments && /^Attachment$/i.test(text) ? '' : text;
};

export const buildForwardMessage = (
  message: IMessage,
  preview: string,
  note: string,
) => {
  const existingSnapshot = message.extraData?.forwardedSnapshot;
  const messageText = stripHtml(stripForwardedMarkers(message.content));
  const hasSocialShare = message.attachments?.some((attachment: IAttachment) =>
    SOCIAL_SHARE_TYPES.has(attachment.type || ''),
  );
  const snapshot = {
    ...(existingSnapshot || {
      content:
        hasSocialShare && ATTACHMENT_PLACEHOLDER_TEXTS.has(messageText)
          ? undefined
          : messageText || undefined,
      embeds: message.extraData?.embeds,
      stickers: message.extraData?.stickers,
      poll: message.extraData?.poll,
      messageKind: message.messageKind,
      providerData: message.providerData,
      createdAt: message.createdAt,
    }),
    attachments: uniqueAttachments(
      existingSnapshot?.attachments || message.attachments,
    ),
  };
  const attachments = (snapshot.attachments || []).map(
    (attachment: IAttachment) => ({
      url: attachment.url,
      name: attachment.name || attachmentFallbackName(attachment.type),
      type: attachment.type,
      size: attachment.size,
      duration: attachment.duration,
    }),
  );
  const forwardedText = forwardedContentText(
    snapshot.content,
    Boolean(attachments.length),
  );
  const forwardedBody =
    forwardedText || (attachments.length === 0 ? preview : '');
  const content = [note.trim(), '↪ Forwarded', forwardedBody]
    .filter(Boolean)
    .join('\n');

  return { snapshot, attachments, content };
};
