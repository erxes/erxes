import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_TAGS } from '@/ebarimt/settings/product-rules-on-tax/graphql/queries/tags';

export const useGetTags = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery(GET_TAGS, {
    ...options,
  });

  const tags = data?.tags.list || [];

  return {
    tags,
    loading,
    error,
  };
};
