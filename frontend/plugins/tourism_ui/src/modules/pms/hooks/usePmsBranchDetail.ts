import { useQuery } from '@apollo/client';
import { pmsQueries } from '../graphql/queries';

export const usePmsBranchDetail = (id: string) => {
  const { data, loading, error, refetch } = useQuery(
    pmsQueries.PmsBranchDetail,
    {
      variables: { id },
      skip: !id,
    },
  );

  return {
    branch: data?.pmsBranchDetail,
    loading,
    error,
    refetch,
  };
};
