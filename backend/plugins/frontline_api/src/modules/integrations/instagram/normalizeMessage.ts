import {
  IInstagramConversationMessage,
  InstagramMessageKind,
} from '@/integrations/instagram/@types/conversationMessages';
import { IMessageData } from '@/integrations/instagram/@types/utils';

const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

const attachmentKind = (type?: string): InstagramMessageKind => {
  if (!type) return 'unsupported';
  if (type === 'story_mention') return 'story_mention';
  if (type === 'story_reply') return 'story_reply';
  if (
    type === 'share' ||
    type === 'fallback' ||
    type === 'ig_post' ||
    type === 'ig_reel'
  )
    return 'share';
  if (type.startsWith('image')) return 'image';
  if (type.startsWith('video')) return 'video';
  if (type.startsWith('audio')) return 'audio';
  if (type === 'file') return 'file';
  return 'unsupported';
};

const previewTextForKind = (kind: InstagramMessageKind): string | undefined => {
  const previews: Partial<Record<InstagramMessageKind, string>> = {
    image: 'Photo',
    video: 'Video',
    audio: 'Audio message',
    file: 'File',
    share: 'Shared content',
    story_mention: 'Story mention',
    story_reply: 'Story reply',
    deleted: 'Message deleted',
    unsupported: 'Unsupported Instagram message',
  };
  return previews[kind];
};

const resolveMessageKind = (
  primaryKind: InstagramMessageKind,
  hasText: boolean,
): InstagramMessageKind => {
  if (primaryKind === 'story_mention' || primaryKind === 'story_reply') {
    return primaryKind;
  }
  if (hasText) return 'text';
  return primaryKind;
};

const fallbackReasonFor = (kind: InstagramMessageKind): string =>
  kind === 'story_mention' || kind === 'story_reply'
    ? 'Story unavailable'
    : 'Unsupported Instagram message';

export const normalizeInstagramMessage = (
  activity: IMessageData,
): Pick<
  IInstagramConversationMessage,
  | 'content'
  | 'attachments'
  | 'messageKind'
  | 'providerData'
  | 'replyTo'
  | 'deliveryStatus'
  | 'expiresAt'
> => {
  const message = activity.message;
  const text = (activity.text || message?.text || '').trim();

  if (message?.is_deleted) {
    return {
      content: '',
      attachments: [],
      messageKind: 'deleted',
      deliveryStatus: 'deleted',
      providerData: {
        messageId: message.mid,
        fallbackReason: 'Message deleted on Instagram',
      },
    };
  }

  const storyReply = message?.reply_to?.story;
  const rawAttachments = storyReply
    ? [
        {
          type: 'story_reply',
          payload: { url: storyReply.url },
        },
      ]
    : message?.attachments || [];
  const primaryType = rawAttachments[0]?.type;
  const primaryKind = attachmentKind(primaryType);
  const messageKind = resolveMessageKind(primaryKind, Boolean(text));
  const attachments = rawAttachments
    .map((attachment) => ({
      type: attachment.type,
      url: attachment.payload?.url || '',
    }))
    .filter((attachment) => Boolean(attachment.url));
  const isStory =
    messageKind === 'story_mention' || messageKind === 'story_reply';
  const fallbackReason =
    !text && attachments.length === 0
      ? fallbackReasonFor(messageKind)
      : undefined;

  return {
    content: text,
    attachments,
    messageKind,
    providerData: {
      messageId: message?.mid,
      attachmentType: primaryType,
      storyUrl: isStory ? attachments[0]?.url : undefined,
      fallbackReason,
      previewText: previewTextForKind(messageKind),
    },
    replyTo: message?.reply_to?.mid
      ? { messageId: message.reply_to.mid }
      : undefined,
    expiresAt: isStory
      ? new Date(activity.timestamp + STORY_LIFETIME_MS)
      : undefined,
  };
};

interface IStoredInstagramMessage {
  mid?: string;
  content?: string;
  createdAt?: Date;
  attachments?: Array<{ type?: string; url?: string }>;
  messageKind?: InstagramMessageKind;
  providerData: IInstagramConversationMessage['providerData'];
  expiresAt?: Date;
}

export const normalizeStoredInstagramMessage = <
  T extends IStoredInstagramMessage,
>(
  message: T,
): T & IStoredInstagramMessage => {
  if (message.messageKind && message.messageKind !== 'unsupported') {
    return message;
  }

  const primaryAttachment = message.attachments?.[0];
  const primaryKind = attachmentKind(primaryAttachment?.type);
  const messageKind = resolveMessageKind(primaryKind, Boolean(message.content));
  const isStory =
    messageKind === 'story_mention' || messageKind === 'story_reply';

  return {
    ...message,
    messageKind,
    providerData: {
      messageId: message.mid,
      attachmentType: primaryAttachment?.type,
      storyUrl: isStory ? primaryAttachment?.url : undefined,
      fallbackReason:
        !message.content && !primaryAttachment?.url
          ? fallbackReasonFor(messageKind)
          : undefined,
      previewText: previewTextForKind(messageKind),
    },
    expiresAt:
      isStory && message.createdAt
        ? new Date(new Date(message.createdAt).getTime() + STORY_LIFETIME_MS)
        : undefined,
  };
};
