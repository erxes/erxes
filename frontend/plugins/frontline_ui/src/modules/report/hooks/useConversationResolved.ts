import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_RESOLVED } from '@/report/graphql/queries/getChart';
import type {
  ReportConversationResolvedQuery,
  ReportConversationResolvedQueryVariables,
} from '~/gql/graphql';

export const useConversationResolved = (
  options?: QueryHookOptions<
    ReportConversationResolvedQuery,
    ReportConversationResolvedQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_CONVERSATION_RESOLVED, options);

  return {
    conversationResolved: data?.reportConversationResolved,
    loading,
    error,
  };
};
