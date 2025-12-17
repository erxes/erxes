import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_RESOLVED } from '@/report/graphql/queries/getChart';

export const useConversationResolved = () => {
  const { data, loading, error } = useQuery(GET_CONVERSATION_RESOLVED);

  return {
    conversationResolved: data?.conversationResolved,
    loading,
    error,
  };
};
