import { useQuery } from '@apollo/client';
import { GET_CONVERSATION_LIST } from '@/report/graphql/queries/getChart';

export const useConversationList = () => {
  const { data, loading, error } = useQuery(GET_CONVERSATION_LIST);

  return {
    conversationList: data?.conversationList,
    loading,
    error,
  };
};
