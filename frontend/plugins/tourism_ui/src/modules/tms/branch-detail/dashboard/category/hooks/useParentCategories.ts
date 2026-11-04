import { QueryHookOptions, useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_PARENT_CATEGORIES } from '../graphql/queries';
import type {
  BmsTourParentCategoriesQuery,
  BmsTourParentCategoriesQueryVariables,
} from '~/gql/graphql';
import { compactList } from '~/utils/cursorList';

export const useParentCategories = (
  options?: QueryHookOptions<
    BmsTourParentCategoriesQuery,
    BmsTourParentCategoriesQueryVariables
  >,
) => {
  const { data, loading } = useQuery(GET_PARENT_CATEGORIES, {
    ...options,
    fetchPolicy: 'no-cache',
  });

  const categories = useMemo(
    () => compactList(data?.bmsTourCategories),
    [data?.bmsTourCategories],
  );

  return {
    loading,
    categories,
  };
};
