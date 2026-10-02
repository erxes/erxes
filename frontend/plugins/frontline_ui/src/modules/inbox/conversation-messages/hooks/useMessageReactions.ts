import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { useMessageReaction } from '@/inbox/conversation-messages/hooks/useMessageReaction';
import {
  aggregateReactions,
  findOwnReaction,
  getMessageReactions,
  getProviderMessageId,
  getReactionKey,
} from '@/inbox/conversation-messages/utils/message';
import { IntegrationType } from '@/types/Integration';

export const useMessageReactions = () => {
  const message = useConversationMessageContext();
  const { _id: conversationId, integration } = useConversationContext();
  const currentUser = useAtomValue(currentUserState);
  const { toggleReaction, loading } = useMessageReaction(
    integration?.kind === IntegrationType.INSTAGRAM_MESSENGER,
  );
  const ownReaction = findOwnReaction(message, currentUser?._id);

  return {
    reactions: aggregateReactions(getMessageReactions(message)),
    ownReactionKey: ownReaction ? getReactionKey(ownReaction) : undefined,
    providerMessageId: getProviderMessageId(message),
    conversationId,
    toggleReaction,
    loading,
  };
};
