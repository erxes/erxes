import { useQuery } from '@apollo/client';
import queries from '../graphql/queries';
import { ProductGroup } from '../create-pos/types';

interface ProductGroupsData {
  productGroups: ProductGroup[];
}

interface ProductGroupsVars {
  posId: string;
}

export const useProductGroups = (posId?: string) => {
  const { data, loading, error, refetch } = useQuery<
    ProductGroupsData,
    ProductGroupsVars
  >(queries.productGroups, {
    variables: { posId: posId || '' },
    skip: !posId,
    fetchPolicy: 'network-only',
  });

  return {
    productGroups: data?.productGroups || [],
    loading,
    error,
    refetch,
  };
};
