import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_SOURCE } from '@/report/graphql/queries/getChart';

interface ConversationSource {
  _id: string;
  name: string;
  count: number;
  percentage: number;
}

interface ConversationSourcesResponse {
  reportConversationSources: ConversationSource[];
}

export const useConversationSources = (
  options: QueryHookOptions<ConversationSourcesResponse>,
) => {
  const { data, loading, error } = useQuery<ConversationSourcesResponse>(
    GET_CONVERSATION_SOURCE,
    options,
  );

  return {
    conversationSources: data?.reportConversationSources,
    loading,
    error,
  };
};
