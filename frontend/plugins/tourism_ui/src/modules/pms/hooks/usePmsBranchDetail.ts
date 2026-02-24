import { useQuery } from '@apollo/client';
import { pmsQueries } from '@/pms/graphql/queries';
import { IPmsBranch } from '@/pms/types/branch';

interface PmsBranchDetailResponse {
  pmsBranchDetail: IPmsBranch;
}

export const usePmsBranchDetail = (id: string) => {
  const { data, loading, error, refetch } = useQuery<PmsBranchDetailResponse>(
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
