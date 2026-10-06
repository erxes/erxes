import type { MessagePresentationState } from '@/inbox/conversation-messages/types/MessagePresentation';
import { stripHtml } from 'erxes-ui';
import { HAS_ATTACHMENT } from '@/inbox/constants/messengerConstants';
import { IntegrationType } from '@/types/Integration';
import { getMessageDisplay } from '@/inbox/conversation-messages/utils/messageDisplay';
import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
export const useMessagePresentation = (): MessagePresentationState => {
  const { previousMessage, ...message } = useConversationMessageContext();
  const { _id: conversationId, integration } = useConversationContext();
  const {
    userId,
    customerId,
    attachments,
    extraData,
    fromBot,
    separatePrevious,
    isGroupConversation,
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
  const hasTextBubble =
    !isDeleted &&
    Boolean(normalizedDisplayContent) &&
    normalizedDisplayContent !== HAS_ATTACHMENT &&
    Boolean(
      normalizedDisplayContent
        ? stripHtml(normalizedDisplayContent).replace(/\s/g, '')
        : '',
    );
  const showAuthorName = Boolean(
    (isGroupConversation ||
      integration?.kind === IntegrationType.DISCORD_MESSENGER) &&
    !userId &&
    customerId &&
    separatePrevious,
  );

  const showBotName = Boolean(fromBot) && separatePrevious;
  const emptyMessageSpacing = separatePrevious ? 'mt-6' : 'mt-1';

  const isStory =
    messageKind === 'story_mention' || messageKind === 'story_reply';
  const fallbackText = providerData?.fallbackReason;

  const hasRenderableContent =
    isDeleted ||
    hasTextBubble ||
    Boolean(attachments?.length) ||
    messageKind === 'share' ||
    Boolean(extraData?.voiceMessage) ||
    Boolean(poll) ||
    Boolean(survey) ||
    Boolean(embeds?.length) ||
    Boolean(stickers?.length) ||
    Boolean(forwardedSnapshot) ||
    Boolean(fallbackText) ||
    isStory;

  return {
    message,
    previousMessage,
    conversationId,
    integration,
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
