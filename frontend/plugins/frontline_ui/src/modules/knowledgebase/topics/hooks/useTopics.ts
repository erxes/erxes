import { QueryHookOptions, useQuery } from '@apollo/client';
import { isUndefinedOrNull, useMultiQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { TOPICS_PER_PAGE } from '@/knowledgebase/constants';
import { TOPICS, TOPIC_OPTIONS } from '@/knowledgebase/graphql/queries';
import { topicsTotalCountAtom } from '@/knowledgebase/topics/states/topicsTotalCountState';
import { ITopic, ITopicListResponse } from '@/knowledgebase/types';

export interface ITopicFilters {
  searchValue?: string;
  brandId?: string;
}

export const useTopicFilters = (): ITopicFilters => {
  const [queries] = useMultiQueryState<{
    searchValue: string;
    brand: string;
  }>(['searchValue', 'brand']);

  const { searchValue, brand } = queries || {};

  return {
    searchValue: searchValue || undefined,
    brandId: brand || undefined,
  };
};

export const useTopics = (options?: QueryHookOptions<ITopicListResponse>) => {
  const setTotalCount = useSetAtom(topicsTotalCountAtom);
  const filters = useTopicFilters();

  const { data, loading, error, refetch } = useQuery<ITopicListResponse>(
    TOPICS,
    {
      ...options,
      variables: {
        page: 1,
        perPage: TOPICS_PER_PAGE,
        ...filters,
      },
    },
  );

  const totalCount = data?.knowledgeBaseTopicsTotalCount;

  useEffect(() => {
    if (isUndefinedOrNull(totalCount)) return;
    setTotalCount(totalCount);
  }, [totalCount, setTotalCount]);

  return {
    topics: data?.knowledgeBaseTopics,
    loading,
    error,
    refetch,
    totalCount,
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
