import { stripHtml } from 'erxes-ui';
import {
  FORWARDED_MARKER,
  stripForwardedMarkers,
} from '@/inbox/conversation-messages/utils/messageActionText';
import type { IMessage } from '@/inbox/types/Conversation';
import { IntegrationType } from '@/types/Integration';

const getPostAttachmentType = (type?: string): string =>
  !type || type === 'file' ? 'image' : type;

const getQuotedReply = (content?: string) => {
  if (!content) return null;

  const prefix = '<blockquote><strong>Replying to';
  const lowerContent = content.toLowerCase();
  if (!lowerContent.startsWith(prefix.toLowerCase())) return null;

  const authorStart = prefix.length;
  const strongEnd = lowerContent.indexOf('</strong>', authorStart);
  if (strongEnd === -1) return null;

  const author = content.slice(authorStart, strongEnd);
  if (author && (!/^\s/.test(author) || author.includes('<'))) return null;

  const breakStart = strongEnd + '</strong>'.length;
  const breakEnd = content.indexOf('>', breakStart);
  if (
    breakEnd === -1 ||
    !/^<br\s*\/?>$/i.test(content.slice(breakStart, breakEnd + 1))
  ) {
    return null;
  }

  const previewStart = breakEnd + 1;
  const blockEnd = lowerContent.indexOf('</blockquote>', previewStart);
  if (blockEnd === -1) return null;

  return {
    author,
    preview: content.slice(previewStart, blockEnd),
    length: blockEnd + '</blockquote>'.length,
  };
};

const getReplyPreview = (content?: string) => {
  if (!content) return '';

  const quotedReply = getQuotedReply(content);
  const withoutQuotedReply = quotedReply
    ? content.slice(quotedReply.length)
    : content;
  return stripHtml(withoutQuotedReply);
};

const getBotText = (botData: IMessage['botData'], isBotMessage: boolean) => {
  if (!isBotMessage || !botData?.length) return undefined;

  return (botData as Array<{ type?: string; text?: string; content?: string }>)
    .filter(
      (item) => item?.type !== 'quickReplies' && item?.type !== 'ticketForm',
    )
    .map((item) => item?.text || item?.content || '')
    .join('');
};

const getEffectiveReplyTo = (
  hasForwardedSnapshot: boolean,
  replyTo: IMessage['replyTo'],
  legacyReplyPreview?: string,
  legacyReplyAuthor?: string,
): IMessage['replyTo'] => {
  if (hasForwardedSnapshot) return undefined;
  if (replyTo) {
    return {
      ...replyTo,
      content: getReplyPreview(replyTo.content) || 'Attachment',
    };
  }
  return legacyReplyPreview
    ? {
        messageId: '',
        authorName: legacyReplyAuthor || undefined,
        content: legacyReplyPreview,
      }
    : undefined;
};

const getPostIntegrationKind = (
  integrationKind?: string,
):
  | IntegrationType.FACEBOOK_POST
  | IntegrationType.INSTAGRAM_POST
  | undefined => {
  if (integrationKind === IntegrationType.FACEBOOK_POST) {
    return IntegrationType.FACEBOOK_POST;
  }
  if (integrationKind === IntegrationType.INSTAGRAM_POST) {
    return IntegrationType.INSTAGRAM_POST;
  }
  return undefined;
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
  const forwardedContentMatch =
    /<blockquote><strong>Forwarded message<\/strong><br\s*\/?>[\s\S]*?<\/blockquote>/i.exec(
      content,
    );

  const botText = getBotText(botData, isBotMessage);

  const legacyReply = getQuotedReply(content);
  const legacyReplyAuthor = stripHtml(legacyReply?.author);
  const legacyReplyPreview = legacyReply
    ? stripHtml(legacyReply.preview) || 'Attachment'
    : '';
  const effectiveReplyTo = getEffectiveReplyTo(
    Boolean(forwardedSnapshot),
    replyTo,
    legacyReplyPreview,
    legacyReplyAuthor,
  );
  const contentWithoutQuotedReply = legacyReply
    ? content.slice(legacyReply.length)
    : content;
  const contentWithoutForwardMarker = isForwardedMessage
    ? stripForwardedMarkers(contentWithoutQuotedReply)
    : contentWithoutQuotedReply;
  const fallbackDisplayContent =
    botText ||
    contentWithoutForwardMarker
      ?.replace(forwardedContentMatch?.[0] || '', '')
      .trim();
  const snapshotHasContent = Boolean(
    forwardedSnapshot?.content ||
      forwardedSnapshot?.attachments?.length ||
      forwardedSnapshot?.stickers?.length ||
      forwardedSnapshot?.embeds?.length ||
      forwardedSnapshot?.poll,
  );
  let displayContent: string | undefined = fallbackDisplayContent;
  if (
    integrationKind === IntegrationType.INSTAGRAM_MESSENGER &&
    forwardedSnapshot
  ) {
    displayContent =
      extraData?.forwardedNote?.trim() ||
      (snapshotHasContent ? undefined : fallbackDisplayContent);
  }
  const postIntegrationKind = getPostIntegrationKind(integrationKind);
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
