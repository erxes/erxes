import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_LIST } from '@/report/graphql/queries/getChart';
import type {
  ReportConversationListQuery,
  ReportConversationListQueryVariables,
} from '~/gql/graphql';

export const useConversationList = (
  options?: QueryHookOptions<
    ReportConversationListQuery,
    ReportConversationListQueryVariables
  >,
) => {
  const { data, previousData, loading, error } = useQuery(
    GET_CONVERSATION_LIST,
    options,
  );

  return {
    conversationList:
      data?.reportConversationList ?? previousData?.reportConversationList,
    isFetching: loading,
    isInitialLoad: loading && !previousData,
    error,
  };
};
