import { isDefined } from 'erxes-ui';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_TAG } from '@/report/graphql/queries/getChart';
import type {
  ReportConversationTagsQuery,
  ReportConversationTagsQueryVariables,
} from '~/gql/graphql';

export const useConversationTags = (
  options?: QueryHookOptions<
    ReportConversationTagsQuery,
    ReportConversationTagsQueryVariables
  >,
) => {
  const { data, loading, error } = useQuery(GET_CONVERSATION_TAG, options);

  return {
    conversationTags: data?.reportConversationTags?.filter(isDefined),
    loading,
    error,
  };
};
