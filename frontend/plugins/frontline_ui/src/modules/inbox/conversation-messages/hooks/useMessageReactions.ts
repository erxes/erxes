import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { useMessageReaction } from '@/inbox/conversation-messages/hooks/useMessageReaction';
import {
  aggregateReactions,
  getOwnReactionKeys,
  getMessageReactions,
  getProviderMessageId,
} from '@/inbox/conversation-messages/utils/message';
import { IntegrationType } from '@/types/Integration';

export const useMessageReactions = () => {
  const message = useConversationMessageContext();
  const { _id: conversationId, integration } = useConversationContext();
  const currentUser = useAtomValue(currentUserState);
  const { toggleReaction, loading } = useMessageReaction(
    integration?.kind === IntegrationType.INSTAGRAM_MESSENGER,
  );

  return {
    reactions: aggregateReactions(getMessageReactions(message)),
    ownReactionKeys: getOwnReactionKeys(message, currentUser?._id),
    providerMessageId: getProviderMessageId(message),
    conversationId,
    toggleReaction,
    loading,
  };
};
