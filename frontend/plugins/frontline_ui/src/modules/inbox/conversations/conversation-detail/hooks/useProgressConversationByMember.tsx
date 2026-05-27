import { QueryHookOptions, useQuery } from '@apollo/client';
import { CONVERSATION_MEMBER_PROGRESS } from '@/inbox/conversations/conversation-detail/graphql/queries/getInboxProgress';
import { IConversationMemberProgress } from '@/inbox/types/Conversation';
import { useEffect } from 'react';
import { CONVERSATION_CHANGED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';

interface IGetConversationMemberProgressResponse {
  conversationMemberProgress: IConversationMemberProgress[];
}

interface IGetConversationMemberProgressVariables {
  customerId: string;
}
export const useGetConversationMemberProgress = (
  options: QueryHookOptions<
    IGetConversationMemberProgressResponse,
    IGetConversationMemberProgressVariables
  >,
) => {
  const { data, loading, refetch, subscribeToMore } = useQuery<
    IGetConversationMemberProgressResponse,
    IGetConversationMemberProgressVariables
  >(CONVERSATION_MEMBER_PROGRESS, options);

  const conversationMemberProgress = data?.conversationMemberProgress;

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: CONVERSATION_CHANGED,
      variables: { customerId: options.variables?.customerId },
      updateQuery: () => {
        refetch();
      },
    });

    return () => {
      unsubscribe();
    };
  }, [options.variables?.customerId, subscribeToMore, refetch]);

  return {
    conversationMemberProgress,
    loading,
    refetch,
  };
};
