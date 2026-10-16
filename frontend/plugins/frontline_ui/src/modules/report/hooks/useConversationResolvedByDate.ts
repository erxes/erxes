import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_RESOLVED_CONVERSATIONS_BY_DATE } from '../graphql/queries/getChart';
import type {
  ReportConversationResolvedDateQuery,
  ReportConversationResolvedDateQueryVariables,
} from '~/gql/graphql';

export const useConversationResolvedByDate = (
  options?: QueryHookOptions<
    ReportConversationResolvedDateQuery,
    ReportConversationResolvedDateQueryVariables
  >,
) => {
  const { data, loading, error, refetch } = useQuery(
    GET_RESOLVED_CONVERSATIONS_BY_DATE,
    options,
  );

  const handleRefetch = (
    variables: ReportConversationResolvedDateQueryVariables,
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
