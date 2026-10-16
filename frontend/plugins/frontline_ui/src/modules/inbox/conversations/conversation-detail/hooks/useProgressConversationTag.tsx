import { QueryHookOptions, useQuery } from '@apollo/client';
import { CONVERSATION_TAG_PROGRESS } from '@/inbox/conversations/conversation-detail/graphql/queries/getInboxProgress';
import type {
  ConversationTagProgressQuery,
  ConversationTagProgressQueryVariables,
} from '~/gql/graphql';

export const useGetConversationTagProgress = (
  options: QueryHookOptions<
    ConversationTagProgressQuery,
    ConversationTagProgressQueryVariables
  >,
) => {
  const { data, loading, refetch } = useQuery(
    CONVERSATION_TAG_PROGRESS,
    options,
  );
  const conversationTagProgress = data?.conversationTagProgress;

  return {
    conversationTagProgress,
    loading,
    refetch,
  };
};
