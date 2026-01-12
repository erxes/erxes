import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_OPEN } from '@/report/graphql/queries/getChart';

interface IConversationOpen {
  count: number;
  percentage: number;
}
export const useConversationOpen = (
  options?: QueryHookOptions<{
    reportConversationOpen: IConversationOpen;
  }>,
) => {
  const { data, loading, error } = useQuery<{
    reportConversationOpen: IConversationOpen;
  }>(GET_CONVERSATION_OPEN, options);

  return {
    conversationOpen: data?.reportConversationOpen,
    loading,
    error,
  };
};
