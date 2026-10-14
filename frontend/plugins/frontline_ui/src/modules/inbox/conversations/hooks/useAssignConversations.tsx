import { useApolloClient, useMutation } from '@apollo/client';
import { CONVERSATION_ASSIGN } from '@/inbox/conversations/graphql/mutations/conversationAssign';
import type { IConversation } from '@/inbox/types/Conversation';

type AssignmentVariables = {
  conversationIds: string[];
  assignedUserId?: string | null;
  assignedUserIds?: string[];
};
type AssignmentResult = Pick<
  IConversation,
  '_id' | 'assignedUserId' | 'assignedUserIds' | 'assignedUsers'
>;

export const useAssignConversations = () => {
  const client = useApolloClient();
  const [assignConversations, { loading }] = useMutation<
    { conversationsAssign: AssignmentResult[] },
    AssignmentVariables
  >(CONVERSATION_ASSIGN, {
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
