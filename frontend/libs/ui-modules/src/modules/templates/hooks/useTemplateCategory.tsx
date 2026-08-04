import { QueryHookOptions, useQuery } from '@apollo/client';
import { QUERY_TEMPLATE_CATEGORY } from '../graphql/queries';

export const useTemplateCategory = (options: QueryHookOptions) => {
  const { data, loading, error } = useQuery(QUERY_TEMPLATE_CATEGORY, {
    ...options,
  });

  const category = data?.templateCategory || {};

  return {
    category,
    loading,
    error,
  };
};
