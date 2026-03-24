import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../graphql/queries';
import { ICategory } from '../types/category';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { categoryTotalCountAtom } from '../states/categoryCounts';

type CategoriesQueryVariables = {
  parentId?: string;
};

export const useCategories = (
  options?: QueryHookOptions<
    {
      bmsTourCategories: ICategory[];
    },
    CategoriesQueryVariables
  >,
) => {
  const variables = options?.variables;
  const normalizedVariables =
    variables &&
    (variables.parentId === null || variables.parentId === ''
      ? { ...variables, parentId: undefined }
      : variables);

  const { data, loading, refetch } = useQuery(GET_CATEGORIES, {
    ...options,
    variables: normalizedVariables,
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
