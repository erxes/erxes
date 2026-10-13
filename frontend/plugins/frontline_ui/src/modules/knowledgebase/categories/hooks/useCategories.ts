import { QueryHookOptions, useQuery } from '@apollo/client';
import { CATEGORIES_PER_PAGE } from '@/knowledgebase/constants';
import { CATEGORIES } from '@/knowledgebase/graphql/queries';
import { ICategoryListResponse } from '@/knowledgebase/types';

export const categoriesQueryVariables = (topicId?: string) => ({
  topicIds: topicId ? [topicId] : [],
  page: 1,
  perPage: CATEGORIES_PER_PAGE,
});

export const useCategories = (
  topicId?: string,
  options?: QueryHookOptions<ICategoryListResponse>,
) => {
  const { data, loading, error, refetch } = useQuery<ICategoryListResponse>(
    CATEGORIES,
    {
      ...options,
      skip: !topicId,
      variables: categoriesQueryVariables(topicId),
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
