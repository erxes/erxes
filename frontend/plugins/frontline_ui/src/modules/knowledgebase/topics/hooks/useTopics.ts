import { useQuery } from '@apollo/client';
import { TOPICS_PER_PAGE } from '@/knowledgebase/constants';
import { TOPICS, TOPIC_OPTIONS } from '@/knowledgebase/graphql/queries';
import { ITopic, ITopicListResponse } from '@/knowledgebase/types';

export const useTopics = () => {
  const { data, loading, error } = useQuery<ITopicListResponse>(TOPICS, {
    variables: { page: 1, perPage: TOPICS_PER_PAGE },
  });

  return {
    topics: data?.knowledgeBaseTopics,
    totalCount: data?.knowledgeBaseTopicsTotalCount,
    loading,
    error,
  };
};

export const useTopicOptions = () => {
  const { data, loading, error } = useQuery<{
    knowledgeBaseTopics: Pick<ITopic, '_id' | 'title' | 'code'>[];
  }>(TOPIC_OPTIONS, {
    variables: { perPage: TOPICS_PER_PAGE },
  });

  return { topics: data?.knowledgeBaseTopics ?? [], loading, error };
};
