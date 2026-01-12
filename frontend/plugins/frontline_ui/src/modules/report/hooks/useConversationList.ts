import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CONVERSATION_LIST } from '@/report/graphql/queries/getChart';
import { ConversationListItem } from '../types';

interface ConversationListResponse {
  reportConversationList: {
    list: ConversationListItem[];
    totalCount: number;
    totalPages: number;
    page: number;
  };
}

export const useConversationList = (
  options?: QueryHookOptions<ConversationListResponse>,
) => {
  const { data, loading, error } = useQuery<ConversationListResponse>(
    GET_CONVERSATION_LIST,
    options,
  );

  return {
    conversationList: data?.reportConversationList,
    loading,
    error,
  };
};
