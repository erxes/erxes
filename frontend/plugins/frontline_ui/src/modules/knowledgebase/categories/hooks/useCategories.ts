import { QueryHookOptions, useQuery } from '@apollo/client';
import { CATEGORIES_PER_PAGE } from '@/knowledgebase/constants';
import { CATEGORIES } from '@/knowledgebase/graphql/queries';
import { ICategoryListResponse } from '@/knowledgebase/types';

export const useCategories = (
  topicId?: string,
  options?: QueryHookOptions<ICategoryListResponse>,
) => {
  const { data, loading, error, refetch } = useQuery<ICategoryListResponse>(
    CATEGORIES,
    {
      ...options,
      skip: !topicId,
      variables: {
        topicIds: topicId ? [topicId] : [],
        page: 1,
        perPage: CATEGORIES_PER_PAGE,
      },
    },
  );

  return {
    categories: data?.knowledgeBaseCategories,
    totalCount: data?.knowledgeBaseCategoriesTotalCount,
    loading,
    error,
    refetch,
  };
};
