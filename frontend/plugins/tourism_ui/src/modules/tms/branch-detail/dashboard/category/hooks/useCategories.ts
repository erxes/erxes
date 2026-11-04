import { QueryHookOptions, useQuery } from '@apollo/client';
import { useMultiQueryState } from 'erxes-ui';
import { GET_CATEGORIES } from '../graphql/queries';
import { useEffect, useMemo } from 'react';
import { useSetAtom } from 'jotai';
import { categoryTotalCountAtom } from '../states/categoryCounts';
import type {
  BmsTourCategoriesQuery,
  BmsTourCategoriesQueryVariables,
} from '~/gql/graphql';
import { compactList } from '~/utils/cursorList';

export const useCategories = (
  options?: QueryHookOptions<
    BmsTourCategoriesQuery,
    BmsTourCategoriesQueryVariables
  >,
) => {
  const [{ searchValue }] = useMultiQueryState<{ searchValue: string }>([
    'searchValue',
  ]);
  const variables = options?.variables;
  const normalizedVariables =
    variables &&
    (variables.parentId === null || variables.parentId === ''
      ? { ...variables, parentId: undefined }
      : variables);

  const { data, loading, refetch } = useQuery(GET_CATEGORIES, {
    ...options,
    variables: {
      ...normalizedVariables,
      name: searchValue || normalizedVariables?.name || undefined,
    },
    fetchPolicy: 'cache-and-network',
  });

  const categories = useMemo(
    () => compactList(data?.bmsTourCategories),
    [data?.bmsTourCategories],
  );

  const setTotalCount = useSetAtom(categoryTotalCountAtom);

  useEffect(() => {
    if (data?.bmsTourCategories) {
      setTotalCount(data.bmsTourCategories.length);
    }
  }, [data, setTotalCount]);

  return {
    loading,
    categories,
    refetch,
  };
};
