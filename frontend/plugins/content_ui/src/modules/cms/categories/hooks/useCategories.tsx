import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { CMS_CATEGORIES } from '../graphql';

export const useCategories = (clientPortalId: string) => {
  const client = useApolloClient();

  const { data, loading, error, refetch } = useQuery(CMS_CATEGORIES, {
    variables: {
      clientPortalId,
      limit: 50,
      cursor: undefined,
      direction: undefined,
    },
    fetchPolicy: 'cache-and-network',
  });

  const categories = data?.cmsCategories?.list || [];
  const totalCount = data?.cmsCategories?.totalCount || 0;

  return {
    categories,
    totalCount,
    loading,
    error,
    refetch,
    client,
  };
};
