import { OperationVariables, useQuery } from '@apollo/client';
import { GET_BRANCH_DETAILS_BY_ID } from '../graphql/queries/getBranches';

const useBranchDetailsById = (options: OperationVariables) => {
  const { data, loading } = useQuery(GET_BRANCH_DETAILS_BY_ID, {
    skip: !options.variables?.id,
    ...options,
  });
  const { branchDetail } = data || {};
  return { branchDetail, loading };
};

export { useBranchDetailsById };
