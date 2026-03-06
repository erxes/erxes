import { QueryHookOptions, useQuery } from '@apollo/client';
import { CONVERSATION_PROGRESS_CHART } from '@/inbox/conversations/conversation-detail/graphql/queries/getInboxProgress';
import { useQueryState } from 'erxes-ui';
import { CONVERSATION_CHANGED } from '@/inbox/conversations/graphql/subscriptions/inboxSubscriptions';
import { useEffect } from 'react';

interface IConversationProgressChart {
  conversationProgressChart: {
    total: number;
    chartData: {
      date: string;
      new: number;
      open: number;
      closed: number;
    }[];
  };
}

export const useConversationProgressChart = (options: QueryHookOptions) => {
  const [assignee] = useQueryState<string>('assignee');

  const { data, loading, refetch, subscribeToMore } =
    useQuery<IConversationProgressChart>(CONVERSATION_PROGRESS_CHART, options);

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
  }, [options.variables?.customerId, subscribeToMore, refetch, assignee]);
  return {
    conversationProgressChart: data?.conversationProgressChart,
    loading,
    refetch,
  };
};
