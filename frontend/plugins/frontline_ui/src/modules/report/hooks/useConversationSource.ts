import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_SOURCE } from '@/report/graphql/queries/getChart';

export const useConversationSources = () => {
  const { data, loading, error } = useQuery(GET_CONVERSATION_SOURCE);

  return {
    conversationSources: data?.conversationSources,
    loading,
    error,
  };
};
