import { type OperationVariables, useQuery } from '@apollo/client';
import { GET_BRANCHES_LIST } from '../graphql';
import { useMultiQueryState } from 'erxes-ui';
import { IBranchListItem } from '../types/branch';

export const useBranchesList = (operationVariables?: OperationVariables) => {
  const [{ searchValue, parentId }] = useMultiQueryState<{
    searchValue: string;
    parentId: string;
  }>(['searchValue', 'parentId']);
  const { data, error, loading } = useQuery(GET_BRANCHES_LIST, {
    variables: {
      ...operationVariables?.variables,
      searchValue,
      parentId,
    },
    ...operationVariables,
  });

  const branches = data?.branchesMain?.list || [];
  const branchesWithHasChildren = branches?.map((branch: IBranchListItem) => ({
    ...branch,
    hasChildren: branches?.some(
      (b: IBranchListItem) => b.parentId === branch._id,
    ),
  }));

  return {
    branches: branchesWithHasChildren,
    sortedBranches: [...(branchesWithHasChildren || [])].sort((a, b) =>
      a.order?.localeCompare(b.order),
    ),
    totalCount: data ? data?.branchesMain?.totalCount : 0,
    loading,
    error,
  };
};
