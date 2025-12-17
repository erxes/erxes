import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_TAG } from '@/report/graphql/queries/getChart';

export const useConversationTags = () => {
  const { data, loading, error } = useQuery(GET_CONVERSATION_TAG);

  return {
    conversationTags: data?.conversationTags,
    loading,
    error,
  };
};
