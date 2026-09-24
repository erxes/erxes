import { stripHtml } from 'erxes-ui';
import { replaceHtmlTags } from '@/inbox/conversation-messages/utils/messageContent';
import {
  FORWARDED_MARKER,
  stripForwardedMarkers,
} from '@/inbox/conversation-messages/utils/messageActionText';
import type { IMessage } from '@/inbox/types/Conversation';
import { IntegrationType } from '@/types/Integration';

const getPostAttachmentType = (type?: string): string =>
  !type || type === 'file' ? 'image' : type;

const getReplyPreview = (content?: string) => {
  if (!content) return '';

  const withoutQuotedReply = content.replace(
    /^<blockquote><strong>Replying to<\/strong><br\s*\/?>[\s\S]*?<\/blockquote>/i,
    '',
  );
  return stripHtml(withoutQuotedReply);
};

export const getMessageDisplay = ({
  message,
  integrationKind,
  isBotMessage,
}: {
  message: IMessage;
  integrationKind?: string;
  isBotMessage: boolean;
}) => {
  const { content, attachments, extraData, botData, replyTo } = message;
  const poll = extraData?.poll;
  const survey = extraData?.survey;
  const embeds = extraData?.embeds;
  const stickers = extraData?.stickers;
  const forwardedSnapshot = extraData?.forwardedSnapshot;
  const isForwardedMessage =
    !forwardedSnapshot && content.search(FORWARDED_MARKER) !== -1;
  const forwardedContentMatch = content?.match(
    /<blockquote><strong>Forwarded message<\/strong><br\s*\/?>[\s\S]*?<\/blockquote>/i,
  );

  const botText =
    isBotMessage && botData?.length
      ? (botData as Array<{ type?: string; text?: string; content?: string }>)
          .filter(
            (item) =>
              item?.type !== 'quickReplies' && item?.type !== 'ticketForm',
          )
          .map((item) => item?.text || item?.content || '')
          .join('')
      : undefined;

  const legacyReplyMatch = content?.match(
    /^<blockquote><strong>Replying to<\/strong><br\s*\/?>[\s\S]*?<\/blockquote>/i,
  );
  const legacyReplyPreview = legacyReplyMatch?.[0]
    ? replaceHtmlTags(legacyReplyMatch[0], ' ')
        .replace(/^\s*Replying to\s*/i, '')
        .replace(/\s+/g, ' ')
        .trim()
    : undefined;
  let effectiveReplyTo: typeof replyTo;
  if (!forwardedSnapshot) {
    if (replyTo) {
      effectiveReplyTo = {
        ...replyTo,
        content: getReplyPreview(replyTo.content) || 'Attachment',
      };
    } else if (legacyReplyPreview) {
      effectiveReplyTo = { messageId: '', content: legacyReplyPreview };
    }
  }
  const contentWithoutForwardMarker = isForwardedMessage
    ? stripForwardedMarkers(content)
    : content;
  const displayContent =
    botText ||
    (legacyReplyMatch
      ? contentWithoutForwardMarker.replace(legacyReplyMatch[0], '')
      : contentWithoutForwardMarker
    )
      ?.replace(forwardedContentMatch?.[0] || '', '')
      .trim();
  const postIntegrationKind:
    | IntegrationType.FACEBOOK_POST
    | IntegrationType.INSTAGRAM_POST
    | undefined =
    integrationKind === IntegrationType.FACEBOOK_POST
      ? IntegrationType.FACEBOOK_POST
      : integrationKind === IntegrationType.INSTAGRAM_POST
      ? IntegrationType.INSTAGRAM_POST
      : undefined;
  const isPostConversation = Boolean(postIntegrationKind);
  const typedAttachments = isPostConversation
    ? attachments?.map((attachment) => ({
        ...attachment,
        type: getPostAttachmentType(attachment.type),
      }))
    : attachments;
  const displayAttachments =
    integrationKind === IntegrationType.FACEBOOK_MESSENGER
      ? typedAttachments?.filter(
          (attachment, index, allAttachments) =>
            attachment.type !== 'sticker' ||
            !allAttachments.some(
              (candidate, candidateIndex) =>
                candidateIndex !== index &&
                candidate.url === attachment.url &&
                candidate.type?.startsWith('image'),
            ),
        )
      : typedAttachments;
  const socialShareAttachment = displayAttachments?.find(
    (attachment) =>
      attachment.type === 'share' ||
      attachment.type === 'post' ||
      attachment.type === 'reel' ||
      attachment.type === 'ig_post' ||
      attachment.type === 'ig_reel',
  );
  const hasImageAttachments = Boolean(
    displayAttachments?.some((attachment) =>
      attachment.type?.startsWith('image'),
    ),
  );
  const isFacebookAttachmentPlaceholder =
    integrationKind === IntegrationType.FACEBOOK_MESSENGER &&
    Boolean(displayAttachments?.length) &&
    [
      'Sent an image',
      'Sent a sticker',
      'Sent a video',
      'Voice message',
      'Sent a file',
      'Shared content',
    ].includes(displayContent || '');
  const isSocialSharePlaceholder =
    Boolean(socialShareAttachment) &&
    ['This message has an attachment', 'Shared content'].includes(
      displayContent || '',
    );
  const strippedFigureContent =
    hasImageAttachments && displayContent
      ? displayContent.replace(
          /<figure\b[^>]*data-url=["'][^"']+["'][^>]*>[\s\S]*?<\/figure>/gi,
          '',
        )
      : displayContent;
  const normalizedDisplayContent =
    isFacebookAttachmentPlaceholder || isSocialSharePlaceholder
      ? undefined
      : strippedFigureContent;

  return {
    poll,
    survey,
    embeds,
    stickers,
    forwardedSnapshot,
    isForwardedMessage,
    effectiveReplyTo,
    postIntegrationKind,
    displayAttachments,
    socialShareAttachment,
    normalizedDisplayContent,
  };
};
