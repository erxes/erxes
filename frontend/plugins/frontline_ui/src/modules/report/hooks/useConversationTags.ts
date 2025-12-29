import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_TAG } from '@/report/graphql/queries/getChart';

interface ConversationTagsResponse {
  reportConversationTags: {
    _id: string;
    name: string;
    count: number;
    percentage: number;
  }[];
}

export const useConversationTags = (
  options?: QueryHookOptions<ConversationTagsResponse>,
) => {
  const { data, loading, error } = useQuery<ConversationTagsResponse>(
    GET_CONVERSATION_TAG,
    options,
  );

  return {
    conversationTags: data?.reportConversationTags,
    loading,
    error,
  };
};
