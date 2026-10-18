import { useQuery } from '@apollo/client';
import { TOPIC_DETAIL } from '@/knowledgebase/graphql/queries';

export const useTopicDetail = (topicId?: string) => {
  const { data, loading, error, refetch } = useQuery(TOPIC_DETAIL, {
    variables: topicId ? { _id: topicId } : undefined,
    skip: !topicId,
  });

  return {
    topic: data?.knowledgeBaseTopicDetail ?? undefined,
    loading,
    error,
    refetch,
  };
};
