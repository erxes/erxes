import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_RESOLVED_CONVERSATIONS_BY_DATE } from '../graphql/queries/getChart';

interface ReportConversationResolvedDate {
  count: number;
  date: string;
}

interface ReportConversationResolvedDateResponse {
  reportConversationResolvedDate: ReportConversationResolvedDate[];
}

export const useConversationResolvedByDate = (
  options?: QueryHookOptions<ReportConversationResolvedDateResponse>,
) => {
  const { data, loading, error, refetch } =
    useQuery<ReportConversationResolvedDateResponse>(
      GET_RESOLVED_CONVERSATIONS_BY_DATE,
      options,
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

