import { useQuery } from '@apollo/client';
import { pmsQueries } from '@/pms/graphql/queries';
import { IPmsBranch } from '@/pms/types/branch';

interface PmsBranchListResponse {
  pmsBranchList: IPmsBranch[];
}

interface UsePmsBranchListParams {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortDirection?: number;
}

export function usePmsBranchList({
  page = 1,
  perPage = 20,
  sortField,
  sortDirection,
}: UsePmsBranchListParams = {}) {
  const { data, loading, error, refetch } = useQuery<PmsBranchListResponse>(
    pmsQueries.PmsBranchList,
    {
      variables: {
        page,
        perPage,
        sortField,
        sortDirection,
      },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );

  const list = data?.pmsBranchList ?? [];

  return { list, loading, error, refetch };
}
