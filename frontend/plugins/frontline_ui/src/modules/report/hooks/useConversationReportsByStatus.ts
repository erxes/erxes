import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_OPEN_CONVERSATIONS_BY_DATE } from '../graphql/queries/getChart';
import type {
  ReportConversationOpenDateQuery,
  ReportConversationOpenDateQueryVariables,
} from '~/gql/graphql';

export const useConversationReportsByStatus = (
  options?: QueryHookOptions<
    ReportConversationOpenDateQuery,
    ReportConversationOpenDateQueryVariables
  >,
) => {
  const { data, loading, error, refetch } = useQuery(
    GET_OPEN_CONVERSATIONS_BY_DATE,
    options,
  );

  const handleRefetch = (
    variables: ReportConversationOpenDateQueryVariables,
  ) => {
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
