import type { IConversation } from '@/inbox/types/Conversation';

export const conversationMessagePreview = (
  conversation: Pick<IConversation, 'content' | 'lastMessage'>,
): { content: string; label?: string } => {
  const message = conversation.lastMessage;
  const content = message ? message.content || '' : conversation.content || '';
  const visibleText = content
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#160;/g, ' ')
    .trim();
  if (visibleText) return { content };
  if (/<img\b/i.test(content)) return { content: '', label: 'Photo' };
  if (/<video\b/i.test(content)) return { content: '', label: 'Video' };
  if (/<audio\b/i.test(content)) return { content: '', label: 'Audio' };
  if (!message) return { content: '', label: 'No messages yet' };
  const { messageKind, attachments, extraData, providerData } = message;
  if (messageKind === 'sticker' || extraData?.stickers?.length)
    return { content: '', label: 'Sticker' };
  if (messageKind === 'unsupported')
    return { content: '', label: 'Unsupported message' };
  if (messageKind === 'deleted' || extraData?.discordDeletedAt)
    return { content: '', label: 'Message deleted' };
  if (extraData?.poll) return { content: '', label: 'Poll' };
  if (extraData?.survey) return { content: '', label: 'Survey' };
  if (extraData?.voiceMessage || messageKind === 'voice')
    return { content: '', label: 'Voice message' };
  if (providerData?.previewText)
    return { content: '', label: providerData.previewText };
  const kind = messageKind || attachments?.[0]?.type?.split('/')[0];
  const labels: Record<string, string> = {
    image: 'Photo',
    video: 'Video',
    audio: 'Audio',
    file: 'Attachment',
    share: 'Shared post',
    story_mention: 'Story mention',
    story_reply: 'Story reply',
    forwarded: 'Forwarded message',
  };
  if (attachments?.length && attachments.length > 1)
    return { content: '', label: `${attachments.length} attachments` };
  if (kind && labels[kind]) return { content: '', label: labels[kind] };
  if (attachments?.length)
    return { content: '', label: attachments[0].name || 'Attachment' };
  if (extraData?.embeds?.length)
    return {
      content: '',
      label: extraData.embeds[0].title || 'Shared content',
    };
  return { content: '', label: 'Unsupported message' };
};
