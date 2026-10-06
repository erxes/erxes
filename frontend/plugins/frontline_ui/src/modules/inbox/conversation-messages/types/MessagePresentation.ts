import type { getMessageDisplay } from '@/inbox/conversation-messages/utils/messageDisplay';
import type { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import type { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
type MessageContext = ReturnType<typeof useConversationMessageContext>;
type ConversationContext = ReturnType<typeof useConversationContext>;
export type MessagePresentationState = ReturnType<typeof getMessageDisplay> & {
  message: Omit<MessageContext, 'previousMessage'>;
  previousMessage: MessageContext['previousMessage'];
  conversationId: ConversationContext['_id'];
  integration: ConversationContext['integration'];
  isDeleted: boolean;
  hasTextBubble: boolean;
  showAuthorName: boolean;
  showBotName: boolean;
  emptyMessageSpacing: string;
  isStory: boolean;
  fallbackText: NonNullable<MessageContext['providerData']>['fallbackReason'];
  hasRenderableContent: boolean;
};
