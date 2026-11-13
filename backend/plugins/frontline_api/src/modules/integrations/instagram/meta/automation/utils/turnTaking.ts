import { getEnv } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { hasReplyableMedia } from '@/integrations/facebook/meta/automation/utils/turnTaking';

type TMessageAttachment = { type?: string; url?: string };

export type TInstagramCustomerMessage = {
  _id: string;
  conversationId?: string;
  content?: string;
  attachments?: TMessageAttachment[] | null;
  createdAt?: Date | string;
};

export const toInstagramInboxMessageId = (messageId: string) =>
  `instagram-${messageId}`;

export const getReplyDebounceMs = (message: TInstagramCustomerMessage) =>
  message.content?.trim() || !hasReplyableMedia(message.attachments)
    ? Number(
        getEnv({
          name: 'INSTAGRAM_REPLY_DEBOUNCE_TEXT_MS',
          defaultValue: '2000',
        }),
      )
    : Number(
        getEnv({
          name: 'INSTAGRAM_REPLY_DEBOUNCE_MEDIA_MS',
          defaultValue: '5000',
        }),
      );

export const hasNewerCustomerMessage = async (
  models: IModels,
  message: TInstagramCustomerMessage,
) => {
  const createdAt = message.createdAt ? new Date(message.createdAt) : null;

  if (
    !message.conversationId ||
    !createdAt ||
    Number.isNaN(createdAt.getTime())
  ) {
    return false;
  }

  return !!(await models.InstagramConversationMessages.exists({
    conversationId: message.conversationId,
    _id: { $ne: message._id },
    createdAt: { $gt: createdAt },
    fromBot: { $ne: true },
    internal: { $ne: true },
    userId: null,
  }));
};
