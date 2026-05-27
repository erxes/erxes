import { QueryHookOptions, useQuery } from '@apollo/client';
import { CONVERSATION_MEMBER_PROGRESS } from '@/inbox/conversations/conversation-detail/graphql/queries/getInboxProgress';
import { IConversationMemberProgress } from '@/inbox/types/Conversation';
import { useQueryState } from 'erxes-ui';
import { getDateRange } from '@/inbox/conversations/conversation-detail/utils/getDateRange';

interface IGetConversationMemberProgressResponse {
  conversationMemberProgress: IConversationMemberProgress[];
}

interface IGetConversationMemberProgressVariables {
  customerId?: string;
  fromDate?: string;
  toDate?: string;
}

export const useGetConversationMemberProgress = (
  options: QueryHookOptions<
    IGetConversationMemberProgressResponse,
    IGetConversationMemberProgressVariables
  >,
) => {
  const [reportDate] = useQueryState<string>('reportDate', {
    defaultValue: 'this-year',
  });
  const dateRange = getDateRange(reportDate);

  const { data, loading, refetch } = useQuery<
    IGetConversationMemberProgressResponse,
    IGetConversationMemberProgressVariables
  >(CONVERSATION_MEMBER_PROGRESS, {
    ...options,
    variables: { ...options.variables, ...dateRange },
  });

  return {
    conversationMemberProgress: data?.conversationMemberProgress,
    loading,
    refetch,
  };
};
