import { useQuery } from '@apollo/client';
import { TOPIC_DETAIL } from '@/knowledgebase/graphql/queries';
import { ITopicDetailResponse } from '@/knowledgebase/types';

export const useTopicDetail = (topicId?: string) => {
  const { data, loading, error, refetch } = useQuery<ITopicDetailResponse>(
    TOPIC_DETAIL,
    {
      variables: { _id: topicId },
      skip: !topicId,
    },
  );

  return {
    topic: data?.knowledgeBaseTopicDetail,
    loading,
    error,
    refetch,
  };
};
