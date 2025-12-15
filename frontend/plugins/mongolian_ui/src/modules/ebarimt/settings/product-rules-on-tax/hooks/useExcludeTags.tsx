import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_EXCLUDE_TAGS } from '@/ebarimt/settings/product-rules-on-tax/graphql/queries/excludeTags';

export const useGetExcludeTags = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery(GET_EXCLUDE_TAGS, {
    ...options,
  });
  const excludeTags = data?.tags.list || [];

  return {
    excludeTags,
    loading,
    error,
  };
};
