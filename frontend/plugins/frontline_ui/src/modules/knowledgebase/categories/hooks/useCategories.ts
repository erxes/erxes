import { QueryHookOptions, useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useMemo } from 'react';
import { CATEGORIES_PER_PAGE } from '@/knowledgebase/constants';
import { CATEGORIES } from '@/knowledgebase/graphql/queries';
import type {
  FrontlineKbCategoriesQuery,
  FrontlineKbCategoriesQueryVariables,
} from '~/gql/graphql';

export const categoriesQueryVariables = (topicId?: string) => ({
  topicIds: topicId ? [topicId] : [],
  page: 1,
  perPage: CATEGORIES_PER_PAGE,
});

export const useCategories = (
  topicId?: string,
  options?: QueryHookOptions<
    FrontlineKbCategoriesQuery,
    FrontlineKbCategoriesQueryVariables
  >,
) => {
  const { data, loading, error, refetch } = useQuery(CATEGORIES, {
    ...options,
    skip: !topicId,
    variables: categoriesQueryVariables(topicId),
  });

  const categories = useMemo(
    () => data?.knowledgeBaseCategories?.filter(isDefined),
    [data?.knowledgeBaseCategories],
  );

  return {
    categories,
    totalCount: data?.knowledgeBaseCategoriesTotalCount,
    loading,
    error,
    refetch,
  };
};
