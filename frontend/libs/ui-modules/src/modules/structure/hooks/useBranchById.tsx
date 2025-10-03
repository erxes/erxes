import { OperationVariables, useQuery } from '@apollo/client';
import { GET_BRANCH_BY_ID } from '../graphql/queries/getBranches';

export const useBranchById = (options: OperationVariables) => {
  const { data, loading } = useQuery(GET_BRANCH_BY_ID, {
    skip: !options.variables?.id,
    ...options,
  });
  const { branchDetail } = data || {};
  return { branchDetail, loading };
};
