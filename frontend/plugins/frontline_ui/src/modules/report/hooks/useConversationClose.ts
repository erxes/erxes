import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_CLOSE } from '@/report/graphql/queries/getChart';
import type {
  ReportConversationClosedQuery,
  ReportConversationClosedQueryVariables,
} from '~/gql/graphql';

export const useConversationClosed = (
  options?: QueryHookOptions<
    ReportConversationClosedQuery,
    ReportConversationClosedQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_CONVERSATION_CLOSE, options);

  return {
    conversationClosed: data?.reportConversationClosed,
    loading,
    error,
  };
};
