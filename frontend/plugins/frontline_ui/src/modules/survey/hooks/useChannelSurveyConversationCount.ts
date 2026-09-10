import { useQuery } from '@apollo/client';
import { GET_CHANNEL_SURVEY_CONVERSATION_COUNT } from '@/survey/graphql/surveyQueries';

export const useChannelSurveyConversationCount = ({
  channelId,
  skip,
}: {
  channelId: string;
  skip?: boolean;
}) => {
  const { data, loading } = useQuery<{ conversationsTotalCount: number }>(
    GET_CHANNEL_SURVEY_CONVERSATION_COUNT,
    {
      variables: { channelId, status: 'new' },
      skip,
      fetchPolicy: 'cache-and-network',
    },
  );

  return { count: data?.conversationsTotalCount || 0, loading };
};
