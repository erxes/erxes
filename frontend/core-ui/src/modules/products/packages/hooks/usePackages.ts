import { useQuery } from '@apollo/client';
import { GET_PACKAGES } from '../graphql/packageQueries';
import { IPackage } from '../types/Package';

export const usePackages = (variables?: {
  searchValue?: string;
  status?: string;
  tagIds?: string[];
  limit?: number;
}) => {
  const { data, loading, error, refetch } = useQuery(GET_PACKAGES, {
    variables,
    fetchPolicy: 'cache-and-network',
  });

  return {
    packages: (data?.productPackages?.list || []) as IPackage[],
    totalCount: data?.productPackages?.totalCount || 0,
    pageInfo: data?.productPackages?.pageInfo,
    loading,
    error,
    refetch,
  };
};
