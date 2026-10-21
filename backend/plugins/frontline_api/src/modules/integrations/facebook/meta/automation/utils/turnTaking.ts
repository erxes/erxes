import { getEnv } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

type TMessageAttachment = { type?: string; url?: string };

type TCustomerMessage = {
  _id: string;
  conversationId?: string;
  content?: string;
  attachments?: TMessageAttachment[] | null;
  createdAt?: Date | string;
};

// What a person sends to show a problem. Stickers, likes and shared links say
// nothing on their own, so they neither wake the agent nor reach a ticket.
const REPLYABLE_MEDIA_TYPES = ['image', 'video', 'audio', 'file'];

const isReplyableMedia = (attachment: TMessageAttachment) =>
  !!attachment.url && REPLYABLE_MEDIA_TYPES.includes(attachment.type || '');

export const hasReplyableMedia = (attachments?: TMessageAttachment[] | null) =>
  (attachments || []).some(isReplyableMedia);

// A media id names one attachment of one stored message, so whoever resolves
// it later reads the same file the model was shown.
export const toAiMediaId = (messageId: string, index: number) =>
  `${messageId}-${index}`;

export const parseAiMediaId = (mediaId: string) => {
  const separator = mediaId.lastIndexOf('-');
  const index = Number(mediaId.slice(separator + 1));

  return separator > 0 && Number.isInteger(index) && index >= 0
    ? { messageId: mediaId.slice(0, separator), index }
    : null;
};

export const listAiMedia = (message: TCustomerMessage) =>
  (message.attachments || []).flatMap((attachment, index) =>
    isReplyableMedia(attachment)
      ? [
          {
            id: toAiMediaId(message._id, index),
            type: attachment.type || 'file',
          },
        ]
      : [],
  );

// The model reads media as a marker it can refer back to, never as a URL.
export const formatMessageForAi = (message: TCustomerMessage) =>
  [
    message.content?.trim() || '',
    ...listAiMedia(message).map(({ id, type }) => `[media ${id} ${type}]`),
  ]
    .filter(Boolean)
    .join(' ');

// People send a thought in pieces — a photo, then a line about it. Waiting
// for a pause answers the pieces together; a photo usually has words coming.
export const getReplyDebounceMs = (message: TCustomerMessage) =>
  message.content?.trim() || !hasReplyableMedia(message.attachments)
    ? Number(getEnv({ name: 'FACEBOOK_REPLY_DEBOUNCE_TEXT_MS', defaultValue: '2000' }))
    : Number(getEnv({ name: 'FACEBOOK_REPLY_DEBOUNCE_MEDIA_MS', defaultValue: '5000' }));

// A newer message from the same person means a later turn will answer, with
// this one in its history; answering both would reply twice.
export const hasNewerCustomerMessage = async (
  models: IModels,
  message: TCustomerMessage,
) => {
  const createdAt = message.createdAt ? new Date(message.createdAt) : null;

  if (!message.conversationId || !createdAt || Number.isNaN(createdAt.getTime())) {
    return false;
  }

  return !!(await models.FacebookConversationMessages.exists({
    conversationId: message.conversationId,
    _id: { $ne: message._id },
    createdAt: { $gt: createdAt },
    fromBot: { $ne: true },
    internal: { $ne: true },
    userId: null,
  }));
};
