import { useQuery } from '@apollo/client';
import { CALL_HISTORY_DETAIL } from '../graphql/queries/callHistoryDetailQuery';

export const useCallConversationDetail = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const { data, loading } = useQuery(CALL_HISTORY_DETAIL, {
    variables: { conversationId },
    skip: !conversationId,
  });

  return {
    callHistoryDetail: data?.callHistoryDetail,
    loading,
  };
};
