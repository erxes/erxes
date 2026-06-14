import { useQuery } from '@apollo/client';
import { GET_PACKAGE_DETAIL } from '../graphql/packageQueries';
import { IPackage } from '../types/Package';

export const usePackageDetail = (id?: string | null) => {
  const { data, loading, error, refetch } = useQuery(GET_PACKAGE_DETAIL, {
    variables: { _id: id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  return {
    package: (data?.productPackageDetail || null) as IPackage | null,
    loading,
    error,
    refetch,
  };
};
