import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_OPEN } from '@/report/graphql/queries/getChart';
import type {
  ReportConversationOpenQuery,
  ReportConversationOpenQueryVariables,
} from '~/gql/graphql';

export const useConversationOpen = (
  options?: QueryHookOptions<
    ReportConversationOpenQuery,
    ReportConversationOpenQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_CONVERSATION_OPEN, options);

  return {
    conversationOpen: data?.reportConversationOpen,
    loading,
    error,
  };
};
