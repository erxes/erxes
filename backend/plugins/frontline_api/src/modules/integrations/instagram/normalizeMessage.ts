import type {
  IInstagramConversationMessage,
  InstagramMessageKind,
} from '@/integrations/instagram/@types/conversationMessages';
import type { IMessageData } from '@/integrations/instagram/@types/utils';

const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

const EXACT_ATTACHMENT_KINDS: Record<string, InstagramMessageKind> = {
  story_mention: 'story_mention',
  story_reply: 'story_reply',
  sticker: 'sticker',
  voice: 'voice',
  share: 'share',
  ig_post: 'share',
  ig_reel: 'share',
  fallback: 'unsupported',
  file: 'file',
};

const MEDIA_KIND_PREFIXES: InstagramMessageKind[] = ['image', 'video', 'audio'];

const PREVIEW_TEXT_BY_KIND: Partial<Record<InstagramMessageKind, string>> = {
  image: 'Photo',
  video: 'Video',
  audio: 'Audio message',
  file: 'File',
  share: 'Shared content',
  story_mention: 'Story mention',
  story_reply: 'Story reply',
  sticker: 'Sticker',
  voice: 'Voice message',
  deleted: 'Message deleted',
  unsupported: 'Unsupported Instagram message',
};

const SHARE_TYPE_BY_ATTACHMENT: Record<string, 'post' | 'reel'> = {
  ig_post: 'post',
  ig_reel: 'reel',
};

const isStoryKind = (kind: InstagramMessageKind) =>
  kind === 'story_mention' || kind === 'story_reply';

const attachmentKind = (type?: string): InstagramMessageKind => {
  if (!type) return 'unsupported';
  if (Object.prototype.hasOwnProperty.call(EXACT_ATTACHMENT_KINDS, type)) {
    return EXACT_ATTACHMENT_KINDS[type];
  }
  return (
    MEDIA_KIND_PREFIXES.find((prefix) => type.startsWith(prefix)) ||
    'unsupported'
  );
};

const resolveMessageKind = (
  attachmentType: string | undefined,
  hasText: boolean,
): InstagramMessageKind => {
  const kind = attachmentKind(attachmentType);
  return kind === 'unsupported' && hasText ? 'text' : kind;
};

const fallbackReasonFor = (kind: InstagramMessageKind) =>
  isStoryKind(kind) ? 'Story unavailable' : 'Unsupported Instagram message';

type TNormalizedCore = Pick<
  IInstagramConversationMessage,
  'messageKind' | 'providerData' | 'expiresAt'
>;

const buildCoreFields = ({
  messageId,
  attachmentType,
  previewUrl,
  hasContent,
  timestampMs,
}: {
  messageId?: string;
  attachmentType?: string;
  previewUrl?: string;
  hasContent: boolean;
  timestampMs?: number;
}): TNormalizedCore => {
  const messageKind = resolveMessageKind(attachmentType, hasContent);
  const isStory = isStoryKind(messageKind);

  return {
    messageKind,
    providerData: {
      messageId,
      attachmentType,
      previewText: PREVIEW_TEXT_BY_KIND[messageKind],
      previewUrl,
      shareType: attachmentType
        ? SHARE_TYPE_BY_ATTACHMENT[attachmentType]
        : undefined,
      storyUrl: isStory ? previewUrl : undefined,
      fallbackReason:
        !hasContent && !previewUrl ? fallbackReasonFor(messageKind) : undefined,
    },
    expiresAt:
      isStory && timestampMs !== undefined
        ? new Date(timestampMs + STORY_LIFETIME_MS)
        : undefined,
  };
};

export const normalizeInstagramMessage = (
  activity: IMessageData,
): Pick<
  IInstagramConversationMessage,
  'messageKind' | 'providerData' | 'replyTo' | 'deliveryStatus' | 'expiresAt'
> => {
  const message = activity.message;
  const text = (activity.text || message?.text || '').trim();

  if (message?.is_deleted) {
    return {
      messageKind: 'deleted',
      deliveryStatus: 'deleted',
      providerData: {
        messageId: message.mid,
        fallbackReason: 'Message deleted on Instagram',
      },
    };
  }
  const storyReply = message?.reply_to?.story;
  const primaryAttachment = storyReply
    ? { type: 'story_reply', payload: { url: storyReply.url } }
    : message?.attachments?.[0];

  return {
    ...buildCoreFields({
      messageId: message?.mid,
      attachmentType: primaryAttachment?.type,
      previewUrl: primaryAttachment?.payload?.url,
      hasContent: Boolean(text),
      timestampMs: activity.timestamp,
    }),
    replyTo: message?.reply_to?.mid
      ? { messageId: message.reply_to.mid }
      : undefined,
    deliveryStatus: 'sent',
  };
};

export const normalizeStoredInstagramMessage = (
  message: IInstagramConversationMessage,
): IInstagramConversationMessage => {
  if (message.messageKind) return message;

  const primaryAttachment = message.attachments?.[0] as
    | { type?: string; url?: string }
    | undefined;

  return {
    ...message,
    ...buildCoreFields({
      messageId: message.mid,
      attachmentType: primaryAttachment?.type,
      previewUrl: primaryAttachment?.url,
      hasContent: Boolean(message.content),
      timestampMs: message.createdAt
        ? new Date(message.createdAt).getTime()
        : undefined,
    }),
    deliveryStatus: 'sent',
  };
};
