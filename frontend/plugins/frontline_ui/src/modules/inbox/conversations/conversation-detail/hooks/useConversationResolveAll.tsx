import { useMutation } from '@apollo/client';
import { CONVERSATION_RESOLVE } from '@/inbox/conversations/graphql/mutations/conversationResolve';

export const useConversationResolveAll = () => {
  const [resolveAllConversations, { loading }] = useMutation(
    CONVERSATION_RESOLVE,
    {
      refetchQueries: [
        'Conversations',
        'ConversationCounts',
        'FrontlineInboxSidebarWorkCounts',
        'GetMyChannels',
      ],
    },
  );

  return {
    resolveAllConversations,
    loading,
  };
};
