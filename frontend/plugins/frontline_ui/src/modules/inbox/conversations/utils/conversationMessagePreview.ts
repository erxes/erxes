import { toMessage } from '@/inbox/conversation-messages/utils/toMessage';
import type {
  IConversationContextValue,
  IMessage,
} from '@/inbox/types/Conversation';
import type { ConversationPreviewLabel } from '../translations';

type MessagePreview = {
  content: string;
  label?: string;
  labelKey?: ConversationPreviewLabel;
  count?: number;
};

// Advance past each tag without retrying an unterminated opening bracket.
const stripTags = (content: string): string => {
  const parts: string[] = [];
  let cursor = 0;
  while (cursor < content.length) {
    const start = content.indexOf('<', cursor);
    if (start < 0) break;
    const end = content.indexOf('>', start + 1);
    if (end < 0) break;
    parts.push(content.slice(cursor, start));
    cursor = end + 1;
  }
  parts.push(content.slice(cursor));
  return parts.join('');
};

export const conversationMessagePreview = (
  conversation: Pick<IConversationContextValue, 'content' | 'lastMessage'>,
): MessagePreview => {
  const message = conversation.lastMessage;
  const content = message ? message.content || '' : conversation.content || '';
  const visibleText = stripTags(content)
    .replace(/&nbsp;|&#160;/g, ' ')
    .trim();
  if (visibleText) return { content };
  if (/<img\b/i.test(content)) return { content: '', labelKey: 'photo' };
  if (/<video\b/i.test(content)) return { content: '', labelKey: 'video' };
  if (/<audio\b/i.test(content)) return { content: '', labelKey: 'audio' };
  if (!message) return { content: '', labelKey: 'noMessages' };
  return messageMetadataPreview(toMessage(message));
};

const messageMetadataPreview = (message: IMessage): MessagePreview => {
  const { messageKind, attachments, extraData, providerData } = message;
  if (messageKind === 'sticker' || extraData?.stickers?.length)
    return { content: '', labelKey: 'sticker' };
  if (messageKind === 'unsupported')
    return { content: '', labelKey: 'unsupported' };
  if (messageKind === 'deleted' || extraData?.discordDeletedAt)
    return { content: '', labelKey: 'deleted' };
  if (extraData?.poll) return { content: '', labelKey: 'poll' };
  if (extraData?.survey) return { content: '', labelKey: 'survey' };
  if (extraData?.voiceMessage || messageKind === 'voice')
    return { content: '', labelKey: 'voice' };
  if (providerData?.previewText)
    return { content: '', label: providerData.previewText };
  const kind = messageKind || attachments?.[0]?.type?.split('/')[0];
  const labels: Record<string, ConversationPreviewLabel> = {
    image: 'photo',
    video: 'video',
    audio: 'audio',
    file: 'attachment',
    share: 'share',
    story_mention: 'storyMention',
    story_reply: 'storyReply',
    forwarded: 'forwarded',
  };
  if (attachments?.length && attachments.length > 1)
    return { content: '', labelKey: 'attachments', count: attachments.length };
  if (kind && labels[kind]) return { content: '', labelKey: labels[kind] };
  return attachmentPreview(attachments, extraData);
};

const attachmentPreview = (
  attachments: IMessage['attachments'],
  extraData: IMessage['extraData'],
): MessagePreview => {
  if (attachments?.length)
    return attachments[0].name
      ? { content: '', label: attachments[0].name }
      : { content: '', labelKey: 'attachment' };
  if (extraData?.embeds?.length)
    return extraData.embeds[0].title
      ? { content: '', label: extraData.embeds[0].title }
      : { content: '', labelKey: 'sharedContent' };
  return { content: '', labelKey: 'unsupported' };
};
