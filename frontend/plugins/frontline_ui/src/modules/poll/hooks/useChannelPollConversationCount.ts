import { useQuery } from '@apollo/client';
import { GET_CHANNEL_POLL_CONVERSATION_COUNT } from '@/poll/graphql/pollQueries';

export const useChannelPollConversationCount = ({
  channelId,
  skip,
}: {
  channelId: string;
  skip?: boolean;
}) => {
  const { data, loading } = useQuery<{ conversationsTotalCount: number }>(
    GET_CHANNEL_POLL_CONVERSATION_COUNT,
    {
      variables: { channelId, status: 'new' },
      skip,
      fetchPolicy: 'cache-and-network',
    },
  );

  return { count: data?.conversationsTotalCount || 0, loading };
};
