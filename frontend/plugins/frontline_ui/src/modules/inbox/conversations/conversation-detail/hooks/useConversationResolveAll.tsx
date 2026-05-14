import { useMutation } from '@apollo/client';
import { CONVERSATION_RESOLVE } from '../../graphql/mutations/conversationResolve';

export const useConversationResolveAll = () => {
  const [resolveAllConversations, { loading }] = useMutation(
    CONVERSATION_RESOLVE,
    {
      refetchQueries: ['Conversations'],
    },
  );

  return {
    resolveAllConversations,
    loading,
  };
};
