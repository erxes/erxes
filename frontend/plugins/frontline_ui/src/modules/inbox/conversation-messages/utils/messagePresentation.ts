import type { MessagePresentationState } from '@/inbox/conversation-messages/types/MessagePresentation';
import { HAS_ATTACHMENT } from '@/inbox/constants/messengerConstants';
import { IntegrationType } from '@/types/Integration';
import { stripHtml } from 'erxes-ui';

export const hasVisibleText = (
  content: string | undefined,
  isDeleted: boolean,
): boolean => {
  if (isDeleted || !content || content === HAS_ATTACHMENT) {
    return false;
  }
  return Boolean(stripHtml(content).replace(/\s/g, ''));
};

export const getAuthorPresentation = (
  message: MessagePresentationState['message'],
  integration: MessagePresentationState['integration'],
): Pick<
  MessagePresentationState,
  'isTelegram' | 'telegramAuthor' | 'showAuthorName'
> => {
  const {
    userId,
    customerId,
    extraData,
    isGroupConversation,
    separatePrevious,
  } = message;
  const isTelegram = integration?.kind === IntegrationType.TELEGRAM_MESSENGER;
  const telegramAuthor =
    isTelegram && !userId && extraData?.telegram?.chatType !== 'private'
      ? extraData?.telegram?.senderName
      : undefined;
  const showAuthorName = Boolean(
    (isGroupConversation ||
      integration?.kind === IntegrationType.DISCORD_MESSENGER ||
      telegramAuthor) &&
    !userId &&
    (customerId || telegramAuthor) &&
    separatePrevious,
  );
  return { isTelegram, telegramAuthor, showAuthorName };
};
