import { useQuery } from '@apollo/client';
import { EBARIMT_PRODUCT_RULES_QUERY } from '../graphql/queries/ebarimtProductRulesQuery';

export const useEbarimtProductRules = (kind: string) => {
  const { data, loading, error, refetch } = useQuery(
    EBARIMT_PRODUCT_RULES_QUERY,
    {
      variables: {
        kind,
      },
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    productRules: data?.ebarimtProductRules?.list || [],
    loading,
    error,
    refetch,
    totalCount: data?.ebarimtProductRules?.totalCount || 0,
  };
};
