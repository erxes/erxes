import { useQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WIDGETS_KNOWLEDGE_BASE_TOPIC } from '../graphql/knowledgeBaseQueries';
import { TKbTopicResponse } from '../types/knowledgeBaseTypes';
import { postToHost } from '../utils/knowledgeBaseUtils';

export const useKnowledgeBaseTopic = () => {
  const [params] = useSearchParams();
  const topicId = params.get('topicId') ?? '';
  const isFloating = params.get('mode') === 'floating';

  const { data, loading, error } = useQuery<TKbTopicResponse>(
    WIDGETS_KNOWLEDGE_BASE_TOPIC,
    {
      variables: { _id: topicId },
      skip: !topicId,
    },
  );

  const topic = data?.cpKnowledgeBaseTopicDetail ?? undefined;
  const categories = useMemo(() => topic?.categories ?? [], [topic]);

  useEffect(() => {
    if (topic) {
      postToHost({ type: 'ready', color: topic.color });
    }
  }, [topic]);

  return {
    topic,
    categories,
    isFloating,
    isLoading: loading && !topic,
    isUnavailable: !topicId || !!error || (!loading && !topic),
  };
};
