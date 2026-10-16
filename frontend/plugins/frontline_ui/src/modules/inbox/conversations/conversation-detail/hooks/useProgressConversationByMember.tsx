import { QueryHookOptions, useQuery } from '@apollo/client';
import { CONVERSATION_MEMBER_PROGRESS } from '@/inbox/conversations/conversation-detail/graphql/queries/getInboxProgress';
import { compactList } from '@/shared/utils/cursorList';
import type {
  ConversationMemberProgressQuery,
  ConversationMemberProgressQueryVariables,
} from '~/gql/graphql';

export const useGetConversationMemberProgress = (
  options: QueryHookOptions<
    ConversationMemberProgressQuery,
    ConversationMemberProgressQueryVariables
  >,
) => {
  const { data, loading, refetch } = useQuery(
    CONVERSATION_MEMBER_PROGRESS,
    options,
  );

  const conversationMemberProgress = compactList(
    data?.conversationMemberProgress,
  );

  return {
    conversationMemberProgress,
    loading,
    refetch,
  };
};
