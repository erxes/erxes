import { isDefined } from 'erxes-ui';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_SOURCE } from '@/report/graphql/queries/getChart';
import type {
  ReportConversationSourcesQuery,
  ReportConversationSourcesQueryVariables,
} from '~/gql/graphql';

export const useConversationSources = (
  options: QueryHookOptions<
    ReportConversationSourcesQuery,
    ReportConversationSourcesQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_CONVERSATION_SOURCE, options);

  return {
    conversationSources: data?.reportConversationSources?.filter(isDefined),
    loading,
    error,
  };
};
