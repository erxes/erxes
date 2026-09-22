import type {
  IInstagramConversationMessage,
  InstagramMessageKind,
} from '@/integrations/instagram/@types/conversationMessages';
import type { IMessageData } from '@/integrations/instagram/@types/utils';

const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

const attachmentKind = (type?: string): InstagramMessageKind => {
  if (!type) return 'unsupported';
  if (type === 'story_mention') return 'story_mention';
  if (type === 'story_reply') return 'story_reply';
  if (type === 'sticker') return 'sticker';
  if (type === 'voice') return 'voice';
  if (['share', 'ig_post', 'ig_reel'].includes(type)) {
    return 'share';
  }
  if (type === 'fallback') {
    return 'unsupported';
  }
  if (type.startsWith('image')) return 'image';
  if (type.startsWith('video')) return 'video';
  if (type.startsWith('audio')) return 'audio';
  if (type === 'file') return 'file';
  return 'unsupported';
};

const previewTextForKind = (kind: InstagramMessageKind) => {
  const previews: Partial<Record<InstagramMessageKind, string>> = {
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

  return previews[kind];
};

const resolveMessageKind = (
  attachmentType: string | undefined,
  hasText: boolean,
) => {
  const kind = attachmentKind(attachmentType);

  if (kind === 'story_mention' || kind === 'story_reply') return kind;
  if (kind !== 'unsupported') return kind;
  return hasText ? 'text' : kind;
};

const shareTypeFor = (type?: string): 'post' | 'reel' | undefined => {
  if (type === 'ig_post') return 'post';
  if (type === 'ig_reel') return 'reel';
  return undefined;
};

const fallbackReasonFor = (kind: InstagramMessageKind) =>
  kind === 'story_mention' || kind === 'story_reply'
    ? 'Story unavailable'
    : 'Unsupported Instagram message';

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
  const isStory =
    messageKind === 'story_mention' || messageKind === 'story_reply';

  return {
    messageKind,
    providerData: {
      messageId,
      attachmentType,
      previewText: previewTextForKind(messageKind),
      previewUrl,
      shareType: shareTypeFor(attachmentType),
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
