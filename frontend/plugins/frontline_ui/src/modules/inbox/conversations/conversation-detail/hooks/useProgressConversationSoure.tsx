import { QueryHookOptions, useQuery } from '@apollo/client';
import { CONVERSATION_SOURCE_PROGRESS } from '@/inbox/conversations/conversation-detail/graphql/queries/getInboxProgress';
import { IConversationSourceProgress } from '@/inbox/types/Conversation';
import { CONVERSATION_CHANGED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import { useEffect } from 'react';
interface IGetConversationSourceProgressResponse {
  conversationSourceProgress: IConversationSourceProgress;
}

interface IGetConversationSourceProgressVariables {
  customerId: string;
}

export const useGetConversationSourceProgress = (
  options: QueryHookOptions<
    IGetConversationSourceProgressResponse,
    IGetConversationSourceProgressVariables
  >,
) => {
  const { data, loading, refetch, subscribeToMore } = useQuery<
    IGetConversationSourceProgressResponse,
    IGetConversationSourceProgressVariables
  >(CONVERSATION_SOURCE_PROGRESS, options);
  const conversationSourceProgress = data?.conversationSourceProgress;

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
    conversationSourceProgress,
    loading,
    refetch,
  };
};
