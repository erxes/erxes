import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useMemo } from 'react';
import { TOPICS_PER_PAGE } from '@/knowledgebase/constants';
import { TOPICS, TOPIC_OPTIONS } from '@/knowledgebase/graphql/queries';

export const useTopics = () => {
  const { data, loading, error } = useQuery(TOPICS, {
    variables: { page: 1, perPage: TOPICS_PER_PAGE },
  });

  const topics = useMemo(
    () => data?.knowledgeBaseTopics?.filter(isDefined),
    [data?.knowledgeBaseTopics],
  );

  return {
    topics,
    totalCount: data?.knowledgeBaseTopicsTotalCount,
    loading,
    error,
  };
};

export const useTopicOptions = () => {
  const { data, loading, error } = useQuery(TOPIC_OPTIONS, {
    variables: { perPage: TOPICS_PER_PAGE },
  });

  const topics = useMemo(
    () => data?.knowledgeBaseTopics?.filter(isDefined) ?? [],
    [data?.knowledgeBaseTopics],
  );

  return { topics, loading, error };
};
