import { isDefined } from 'erxes-ui';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_RESPONSES } from '@/report/graphql/queries/getChart';
import type {
  ReportConversationResponsesQuery,
  ReportConversationResponsesQueryVariables,
} from '~/gql/graphql';

export const useConversationResponses = (
  options?: QueryHookOptions<
    ReportConversationResponsesQuery,
    ReportConversationResponsesQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(
    GET_CONVERSATION_RESPONSES,
    options,
  );

  return {
    conversationResponses: data?.reportConversationResponses?.filter(isDefined),
    loading,
    error,
  };
};
