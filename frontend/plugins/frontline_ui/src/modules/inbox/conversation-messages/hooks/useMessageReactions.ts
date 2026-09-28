import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { useMessageReaction } from '@/inbox/conversation-messages/hooks/useMessageReaction';
import {
  aggregateReactions,
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
  const reactions = message.reactions?.length
    ? message.reactions
    : message.extraData?.reactions;
  const ownReaction = reactions?.find(
    (reaction) => reaction.senderId === currentUser?._id,
  );

  return {
    reactions: aggregateReactions(reactions),
    ownReactionKey: ownReaction ? getReactionKey(ownReaction) : undefined,
    providerMessageId: getProviderMessageId(message),
    conversationId,
    toggleReaction,
    loading,
  };
};
