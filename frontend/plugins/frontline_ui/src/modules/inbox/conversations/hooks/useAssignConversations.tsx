import { useApolloClient, useMutation } from '@apollo/client';
import { CONVERSATION_ASSIGN } from '@/inbox/conversations/graphql/mutations/conversationAssign';

export const useAssignConversations = () => {
  const client = useApolloClient();
  const [assignConversations, { loading }] = useMutation(CONVERSATION_ASSIGN, {
    awaitRefetchQueries: true,
    refetchQueries: () =>
      [...client.getObservableQueries('active').values()]
        .filter((query) =>
          [
            'ConversationDetail',
            'Conversations',
            'GetMyChannels',
            'FrontlineInboxSidebarWorkCounts',
            'ConversationCounts',
            'FrontlineInboxConversationFilterCounts',
            'ConversationMemberProgress',
          ].includes(query.queryName ?? ''),
        )
        .map((query) => ({
          query: query.options.query,
          variables: query.variables,
        })),
  });
  return { assignConversations, loading };
};
