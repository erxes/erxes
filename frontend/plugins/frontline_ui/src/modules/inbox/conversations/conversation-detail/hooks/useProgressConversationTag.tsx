import { QueryHookOptions, useQuery } from '@apollo/client';
import { CONVERSATION_TAG_PROGRESS } from '@/inbox/conversations/conversation-detail/graphql/queries/getInboxProgress';
import { IConversationTagProgress } from '@/inbox/types/Conversation';
import { useQueryState } from 'erxes-ui';
import { getDateRange } from '@/inbox/conversations/conversation-detail/utils/getDateRange';

interface IGetConversationTagProgressResponse {
  conversationTagProgress: IConversationTagProgress;
}

interface IGetConversationTagProgressVariables {
  customerId?: string;
  fromDate?: string;
  toDate?: string;
}

export const useGetConversationTagProgress = (
  options: QueryHookOptions<
    IGetConversationTagProgressResponse,
    IGetConversationTagProgressVariables
  >,
) => {
  const [reportDate] = useQueryState<string>('reportDate', {
    defaultValue: 'this-year',
  });
  const dateRange = getDateRange(reportDate);

  const { data, loading, refetch } = useQuery<
    IGetConversationTagProgressResponse,
    IGetConversationTagProgressVariables
  >(CONVERSATION_TAG_PROGRESS, {
    ...options,
    variables: { ...options.variables, ...dateRange },
  });

  return {
    conversationTagProgress: data?.conversationTagProgress,
    loading,
    refetch,
  };
};
