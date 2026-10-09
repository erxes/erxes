import type { MessagePresentationState } from '@/inbox/conversation-messages/types/MessagePresentation';
import { getMessageDisplay } from '@/inbox/conversation-messages/utils/messageDisplay';
import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import {
  getAuthorPresentation,
  hasVisibleText,
} from '@/inbox/conversation-messages/utils/messagePresentation';

export const useMessagePresentation = (): MessagePresentationState => {
  const { previousMessage, ...message } = useConversationMessageContext();
  const { _id: conversationId, integration } = useConversationContext();
  const {
    attachments,
    extraData,
    fromBot,
    separatePrevious,
    isBotMessage,
    messageKind,
    providerData,
    deliveryStatus,
  } = message;

  const {
    poll,
    survey,
    embeds,
    stickers,
    forwardedSnapshot,
    isForwardedMessage,
    effectiveReplyTo,
    postIntegrationKind,
    displayAttachments,
    socialShareAttachment,
    normalizedDisplayContent,
  } = getMessageDisplay({
    message,
    integrationKind: integration?.kind,
    isBotMessage,
  });
  const isDeleted =
    Boolean(extraData?.discordDeletedAt) ||
    messageKind === 'deleted' ||
    deliveryStatus === 'deleted';
  const hasTextBubble = hasVisibleText(normalizedDisplayContent, isDeleted);
  const { isTelegram, telegramAuthor, showAuthorName } = getAuthorPresentation(
    message,
    integration,
  );

  const showBotName = Boolean(fromBot) && separatePrevious;
  const emptyMessageSpacing = separatePrevious ? 'mt-6' : 'mt-1';

  const isStory =
    messageKind === 'story_mention' || messageKind === 'story_reply';
  const fallbackText = providerData?.fallbackReason;

  const hasRenderableContent = [
    isDeleted,
    hasTextBubble,
    attachments?.length,
    messageKind === 'share',
    extraData?.voiceMessage,
    poll,
    survey,
    embeds?.length,
    stickers?.length,
    forwardedSnapshot,
    fallbackText,
    isStory,
  ].some(Boolean);

  return {
    message,
    previousMessage,
    conversationId,
    integration,
    isTelegram,
    telegramAuthor,
    poll,
    survey,
    embeds,
    stickers,
    forwardedSnapshot,
    isForwardedMessage,
    effectiveReplyTo,
    postIntegrationKind,
    displayAttachments,
    socialShareAttachment,
    normalizedDisplayContent,
    isDeleted,
    hasTextBubble,
    showAuthorName,
    showBotName,
    emptyMessageSpacing,
    isStory,
    fallbackText,
    hasRenderableContent,
  };
};
