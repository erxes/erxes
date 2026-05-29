import { useQuery } from '@apollo/client';
import { GET_PACKAGES } from '../graphql/packageQueries';
import { IPackage } from '../types/Package';

export const usePackages = (variables?: {
  searchValue?: string;
  status?: string;
  limit?: number;
}) => {
  const { data, loading, error, refetch } = useQuery(GET_PACKAGES, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  return {
    packages: (data?.packages?.list || []) as IPackage[],
    totalCount: data?.packages?.totalCount || 0,
    pageInfo: data?.packages?.pageInfo,
    loading,
    error,
    refetch,
  };
};
