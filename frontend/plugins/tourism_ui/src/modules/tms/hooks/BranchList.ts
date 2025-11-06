import { useQuery } from '@apollo/client';
import { GET_BRANCH_LIST } from '../graphql/queries';
import { IBranch } from '../types/branch';

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

interface BranchListResponse {
  bmsBranchList: {
    list: IBranch[];
    totalCount: number;
    pageInfo: PageInfo;
  };
}

interface UseBranchListParams {
  limit?: number;
  cursor?: string | null;
  cursorMode?: 'AFTER' | 'BEFORE';
  direction?: 'FORWARD' | 'BACKWARD';
  orderBy?: Record<string, any>;
}

export const useBranchList = ({
  limit = 30,
  cursor,
  cursorMode,
  direction,
  orderBy = { createdAt: -1 },
}: UseBranchListParams = {}) => {
  const { data, loading, error, refetch } = useQuery<BranchListResponse>(
    GET_BRANCH_LIST,
    {
      variables: {
        limit,
        cursor,
        cursorMode,
        direction,
        orderBy,
      },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );

  const list = data?.bmsBranchList?.list || [];
  const totalCount = data?.bmsBranchList?.totalCount || 0;
  const pageInfo = data?.bmsBranchList?.pageInfo;

  return { list, totalCount, pageInfo, loading, error, refetch };
};
