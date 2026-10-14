import type { IConversation } from '@/inbox/types/Conversation';
import type { ConversationPreviewLabel } from '../translations';

export const conversationMessagePreview = (
  conversation: Pick<IConversation, 'content' | 'lastMessage'>,
): {
  content: string;
  label?: string;
  labelKey?: ConversationPreviewLabel;
  count?: number;
} => {
  const message = conversation.lastMessage;
  const content = message ? message.content || '' : conversation.content || '';
  const visibleText = content
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#160;/g, ' ')
    .trim();
  if (visibleText) return { content };
  if (/<img\b/i.test(content)) return { content: '', labelKey: 'photo' };
  if (/<video\b/i.test(content)) return { content: '', labelKey: 'video' };
  if (/<audio\b/i.test(content)) return { content: '', labelKey: 'audio' };
  if (!message) return { content: '', labelKey: 'noMessages' };
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
