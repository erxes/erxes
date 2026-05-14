import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_OPEN_CONVERSATIONS_BY_DATE } from '../graphql/queries/getChart';

interface ReportConversationOpenDate {
  count: number;
  date: string;
}

interface ReportConversationOpenDateResponse {
  reportConversationOpenDate: ReportConversationOpenDate[];
}

export const useConversationReportsByStatus = (
  options?: QueryHookOptions<ReportConversationOpenDateResponse>,
) => {
  const { data, loading, error, refetch } =
    useQuery<ReportConversationOpenDateResponse>(
      GET_OPEN_CONVERSATIONS_BY_DATE,
      {
        ...options,
        variables: {
          ...options?.variables,
          status: 'open',
        },
      },
    );

  const handleRefetch = (variables: any) => {
    if (!refetch) return;
    refetch(variables);
  };

  return {
    reports: data,
    loading,
    error,
    handleRefetch,
  };
};
