import { NetworkStatus, OperationVariables, useQuery } from '@apollo/client';
import { productsQueries } from '@/products/graphql';

export const useProductCategories = (options?: OperationVariables) => {
  const { data, loading, error, networkStatus } = useQuery(
    productsQueries.productCategories,
    { notifyOnNetworkStatusChange: true, ...options },
  );

  const { productCategories } = data || {};

  return {
    productCategories,
    loading,
    error,
    networkStatus,
    refetching:
      networkStatus === NetworkStatus.refetch ||
      networkStatus === NetworkStatus.setVariables,
  };
};
