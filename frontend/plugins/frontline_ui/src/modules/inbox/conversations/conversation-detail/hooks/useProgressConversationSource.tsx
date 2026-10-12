import { QueryHookOptions, useQuery } from '@apollo/client';
import { CONVERSATION_SOURCE_PROGRESS } from '@/inbox/conversations/conversation-detail/graphql/queries/getInboxProgress';
import type {
  ConversationSourceProgressQuery,
  ConversationSourceProgressQueryVariables,
} from '~/gql/graphql';

export const useGetConversationSourceProgress = (
  options: QueryHookOptions<
    ConversationSourceProgressQuery,
    ConversationSourceProgressQueryVariables
  >,
) => {
  const { data, loading, refetch } = useQuery(
    CONVERSATION_SOURCE_PROGRESS,
    options,
  );
  const conversationSourceProgress = data?.conversationSourceProgress;

  return {
    conversationSourceProgress,
    loading,
    refetch,
  };
};
