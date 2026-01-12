import { QueryHookOptions, useQuery } from '@apollo/client';
import { CONVERSATION_TAG_PROGRESS } from '@/inbox/conversations/conversation-detail/graphql/queries/getInboxProgress';
import { IConversationTagProgress } from '@/inbox/types/Conversation';
import { useEffect } from 'react';
import { CONVERSATION_CHANGED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';

interface IGetConversationTagProgressResponse {
  conversationTagProgress: IConversationTagProgress;
}

interface IGetConversationTagProgressVariables {
  customerId: string;
}
export const useGetConversationTagProgress = (
  options: QueryHookOptions<
    IGetConversationTagProgressResponse,
    IGetConversationTagProgressVariables
  >,
) => {
  const { data, loading, refetch, subscribeToMore } = useQuery<
    IGetConversationTagProgressResponse,
    IGetConversationTagProgressVariables
  >(CONVERSATION_TAG_PROGRESS, options);
  const conversationTagProgress = data?.conversationTagProgress;
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
    conversationTagProgress,
    loading,
    refetch,
    subscribeToMore,
  };
};
