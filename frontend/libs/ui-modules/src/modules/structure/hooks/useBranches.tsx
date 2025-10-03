import { QueryHookOptions, useQuery } from '@apollo/client';
import { EnumCursorDirection, ICursorListResponse } from 'erxes-ui';
import { IBranch } from '../types/Branch';
import { GET_BRANCHES_MAIN } from '../graphql/queries/getBranches';

const BRANCHES_PER_PAGE = 20;

export const useBranches = (
  options?: QueryHookOptions<ICursorListResponse<IBranch>>,
) => {
  const { data, loading, error, fetchMore } = useQuery<
    ICursorListResponse<IBranch>
  >(GET_BRANCHES_MAIN, { ...options });

  const { list: branches, totalCount = 0, pageInfo } = data?.branchesMain ?? {};

  const handleFetchMore = () => {
    if (totalCount <= (branches?.length || 0)) return;
    fetchMore({
      variables: {
        ...options?.variables,
        cursor: pageInfo?.endCursor,
        limit: BRANCHES_PER_PAGE,
        direction: EnumCursorDirection.FORWARD,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return Object.assign({}, prev, {
          branchesMain: {
            list: [
              ...(prev.branchesMain?.list || []),
              ...fetchMoreResult.branchesMain.list,
            ],
            totalCount: fetchMoreResult.branchesMain.totalCount,
            pageInfo: fetchMoreResult.branchesMain.pageInfo,
          },
        });
      },
    });
  };

  const branchesWithHasChildren = branches?.map((branch) => ({
    ...branch,
    hasChildren: branches?.some((p) => p.parentId === branch._id),
  }));

  return {
    branches: branchesWithHasChildren,
    sortedBranches: [...(branchesWithHasChildren || [])].sort((a, b) =>
      a.order?.localeCompare(b.order),
    ),
    totalCount,
    pageInfo,
    loading,
    error,
    handleFetchMore,
  };
};
