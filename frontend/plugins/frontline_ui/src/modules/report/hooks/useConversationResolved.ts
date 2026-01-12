import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_RESOLVED } from '@/report/graphql/queries/getChart';

interface IConversationResolved {
  count: number;
  percentage: number;
}
export const useConversationResolved = (
  options?: QueryHookOptions<{
    reportConversationResolved: IConversationResolved;
  }>,
) => {
  const { data, loading, error } = useQuery<{
    reportConversationResolved: IConversationResolved;
  }>(GET_CONVERSATION_RESOLVED, options);

  return {
    conversationResolved: data?.reportConversationResolved,
    loading,
    error,
  };
};
