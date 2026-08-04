import { QueryHookOptions, useQuery } from '@apollo/client';
import { useMultiQueryState } from 'erxes-ui';
import { GET_CATEGORIES } from '../graphql/queries';
import { ICategory } from '../types/category';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { categoryTotalCountAtom } from '../states/categoryCounts';

type CategoriesQueryVariables = {
  parentId?: string;
  name?: string;
  branchId?: string;
  language?: string;
};

export const useCategories = (
  options?: QueryHookOptions<
    {
      bmsTourCategories: ICategory[];
    },
    CategoriesQueryVariables
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

  const categories = data?.bmsTourCategories || [];

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
