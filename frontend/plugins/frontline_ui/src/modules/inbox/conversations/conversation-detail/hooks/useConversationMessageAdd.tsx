import type { ConversationMessageAddResult } from '@/integrations/facebook/types/FacebookReplyDelivery';
import { useMutation } from '@apollo/client';
import { ADD_CONVERSATION_MESSAGE } from '@/inbox/conversations/conversation-detail/graphql/mutations/addConversationMessage';

export const useConversationMessageAdd = () => {
  const [addConversationMessage, { loading }] =
    useMutation<ConversationMessageAddResult>(ADD_CONVERSATION_MESSAGE);

  return {
    addConversationMessage,
    loading,
  };
};
