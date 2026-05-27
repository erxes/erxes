import { QueryHookOptions, useQuery } from '@apollo/client';
import { CONVERSATION_PROGRESS_CHART } from '@/inbox/conversations/conversation-detail/graphql/queries/getInboxProgress';
import { useQueryState } from 'erxes-ui';
import { getDateRange } from '@/inbox/conversations/conversation-detail/utils/getDateRange';

interface IConversationProgressChart {
  conversationProgressChart: {
    total: number;
    chartData: {
      date: string;
      new: number;
      open: number;
      closed: number;
      resolved: number;
    }[];
  };
}

export const useConversationProgressChart = (options: QueryHookOptions) => {
  const [reportDate] = useQueryState<string>('reportDate', {
    defaultValue: 'this-year',
  });
  const dateRange = getDateRange(reportDate);

  const { data, loading, refetch } =
    useQuery<IConversationProgressChart>(CONVERSATION_PROGRESS_CHART, {
      ...options,
      variables: { ...options.variables, ...dateRange },
    });

  return {
    conversationProgressChart: data?.conversationProgressChart,
    loading,
    refetch,
  };
};
