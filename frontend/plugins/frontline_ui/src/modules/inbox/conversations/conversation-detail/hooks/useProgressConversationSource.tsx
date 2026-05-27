import { QueryHookOptions, useQuery } from '@apollo/client';
import { CONVERSATION_SOURCE_PROGRESS } from '@/inbox/conversations/conversation-detail/graphql/queries/getInboxProgress';
import { IConversationSourceProgress } from '@/inbox/types/Conversation';
import { useQueryState } from 'erxes-ui';
import { getDateRange } from '@/inbox/conversations/conversation-detail/utils/getDateRange';

interface IGetConversationSourceProgressResponse {
  conversationSourceProgress: IConversationSourceProgress;
}

interface IGetConversationSourceProgressVariables {
  customerId?: string;
  fromDate?: string;
  toDate?: string;
}

export const useGetConversationSourceProgress = (
  options: QueryHookOptions<
    IGetConversationSourceProgressResponse,
    IGetConversationSourceProgressVariables
  >,
) => {
  const [reportDate] = useQueryState<string>('reportDate', {
    defaultValue: 'this-year',
  });
  const dateRange = getDateRange(reportDate);

  const { data, loading, refetch } = useQuery<
    IGetConversationSourceProgressResponse,
    IGetConversationSourceProgressVariables
  >(CONVERSATION_SOURCE_PROGRESS, {
    ...options,
    variables: { ...options.variables, ...dateRange },
  });

  return {
    conversationSourceProgress: data?.conversationSourceProgress,
    loading,
    refetch,
  };
};
