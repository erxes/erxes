import {
  ConversationStatus,
  type IConversationContextValue,
} from '@/inbox/types/Conversation';

export const CONVERSATION_IDLE_TIMEOUT = 5 * 60_000;

export const conversationIdleSince = (
  conversation: Pick<
    IConversationContextValue,
    'status' | 'integration' | 'lastMessage' | 'createdAt'
  >,
): number | null => {
  const kind = conversation.integration?.kind;
  if (
    !kind ||
    conversation.status == null ||
    conversation.status === ConversationStatus.CLOSED ||
    kind === 'form' ||
    kind === 'lead' ||
    kind === 'mail' ||
    kind === 'gmail' ||
    kind.includes('nylas') ||
    conversation.lastMessage === undefined
  )
    return null;

  const timestamp = Date.parse(
    conversation.lastMessage === null
      ? conversation.createdAt ?? ''
      : conversation.lastMessage.createdAt ?? '',
  );
  return Number.isFinite(timestamp) ? timestamp : null;
};
