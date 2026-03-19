import { QueryHookOptions, useQuery } from '@apollo/client';
import { GET_CATEGORIES } from '../graphql/queries';
import { ICategory } from '../types/category';

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

  return {
    loading,
    categories,
    refetch,
  };
};
