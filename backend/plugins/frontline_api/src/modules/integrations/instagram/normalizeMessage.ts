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
  if (['share', 'fallback', 'ig_post', 'ig_reel'].includes(type)) {
    return 'share';
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

export const normalizeInstagramMessage = (
  activity: IMessageData,
): Pick<
  IInstagramConversationMessage,
  'messageKind' | 'providerData' | 'replyTo' | 'expiresAt'
> => {
  const message = activity.message;
  const text = (activity.text || message?.text || '').trim();
  const storyReply = message?.reply_to?.story;
  const primaryAttachment = storyReply
    ? { type: 'story_reply', payload: { url: storyReply.url } }
    : message?.attachments?.[0];
  const attachmentType = primaryAttachment?.type;
  const previewUrl = primaryAttachment?.payload?.url;
  const messageKind = resolveMessageKind(attachmentType, Boolean(text));
  const isStory =
    messageKind === 'story_mention' || messageKind === 'story_reply';

  return {
    messageKind,
    providerData: {
      messageId: message?.mid,
      attachmentType,
      previewText: previewTextForKind(messageKind),
      previewUrl,
      shareType: shareTypeFor(attachmentType),
      storyUrl: isStory ? previewUrl : undefined,
      fallbackReason:
        !text && !previewUrl ? fallbackReasonFor(messageKind) : undefined,
    },
    replyTo: message?.reply_to?.mid
      ? { messageId: message.reply_to.mid }
      : undefined,
    expiresAt: isStory
      ? new Date(activity.timestamp + STORY_LIFETIME_MS)
      : undefined,
  };
};

export const normalizeStoredInstagramMessage = (
  message: IInstagramConversationMessage,
): IInstagramConversationMessage => {
  if (message.messageKind) return message;

  const primaryAttachment = message.attachments?.[0] as
    | { type?: string; url?: string }
    | undefined;
  const attachmentType = primaryAttachment?.type;
  const messageKind = resolveMessageKind(
    attachmentType,
    Boolean(message.content),
  );
  const isStory =
    messageKind === 'story_mention' || messageKind === 'story_reply';

  return {
    ...message,
    messageKind,
    providerData: {
      messageId: message.mid,
      attachmentType,
      previewText: previewTextForKind(messageKind),
      previewUrl: primaryAttachment?.url,
      shareType: shareTypeFor(attachmentType),
      storyUrl: isStory ? primaryAttachment?.url : undefined,
      fallbackReason:
        !message.content && !primaryAttachment?.url
          ? fallbackReasonFor(messageKind)
          : undefined,
    },
    deliveryStatus: 'sent',
    expiresAt:
      isStory && message.createdAt
        ? new Date(new Date(message.createdAt).getTime() + STORY_LIFETIME_MS)
        : undefined,
  };
};
