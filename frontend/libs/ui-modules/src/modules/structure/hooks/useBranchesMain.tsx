import { OperationVariables, useQuery } from '@apollo/client';
import { GET_BRANCHES_MAIN } from '../graphql/queries/getBranches';
import { IBranch } from '../types/Branch';
export const useBranchesMain = (options?: OperationVariables) => {
  const { data, loading, fetchMore, error } = useQuery<{
    branchesMain: {
      list: IBranch[];
      totalCount?: number;
      totalUsersCount?: number;
    };
  }>(GET_BRANCHES_MAIN, options);

  const branchesWithHasChildren = data?.branchesMain?.list?.map(
    (branch: IBranch) => ({
      ...branch,
      hasChildren: data?.branchesMain?.list?.some(
        (b: IBranch) => b.parentId === branch._id,
      ),
    }),
  );

  const handleFetchMore = () => {
    fetchMore({
      variables: {
        ...options,
      },
    });
  };

  return {
    branches: data?.branchesMain?.list,
    sortedBranches: [...(branchesWithHasChildren || [])].sort((a, b) =>
      (a.order || '').localeCompare(b.order || ''),
    ),
    loading,
    error,
    handleFetchMore,
    totalCount: data?.branchesMain?.totalCount,
  };
};
