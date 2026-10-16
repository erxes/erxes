import { QueryHookOptions, useQuery } from '@apollo/client';
import { CONVERSATION_PROGRESS_CHART } from '@/inbox/conversations/conversation-detail/graphql/queries/getInboxProgress';
import type {
  ConversationProgressChartQuery,
  ConversationProgressChartQueryVariables,
} from '~/gql/graphql';

export const useConversationProgressChart = (
  options: QueryHookOptions<
    ConversationProgressChartQuery,
    ConversationProgressChartQueryVariables
  >,
) => {
  const { data, loading, refetch } = useQuery(
    CONVERSATION_PROGRESS_CHART,
    options,
  );

  return {
    conversationProgressChart: data?.conversationProgressChart,
    loading,
    refetch,
  };
};
