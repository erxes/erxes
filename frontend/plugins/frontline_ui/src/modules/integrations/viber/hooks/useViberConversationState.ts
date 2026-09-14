import { useQuery } from '@apollo/client';
import { VIBER_CONVERSATION_STATE } from '../graphql';

export const useViberConversationState = (
  conversationId: string,
  enabled: boolean,
) => {
  const { data, loading, error, refetch } = useQuery<{
    viberConversationState: {
      canSend: boolean;
      reason: string | null;
      subscribed: boolean | null;
    };
  }>(VIBER_CONVERSATION_STATE, {
    variables: { conversationId },
    skip: !enabled || !conversationId,
    fetchPolicy: 'cache-and-network',
    pollInterval: enabled ? 30_000 : 0,
  });
  return {
    canSend: Boolean(data?.viberConversationState.canSend) && !error,
    reason: error?.message || data?.viberConversationState.reason,
    loading,
    refetch,
  };
};
