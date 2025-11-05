import { useQuery } from '@apollo/client';
import { BRANCH_LIST_DETAIL } from '../graphql/queries';
import { IBranch } from '../types/branch';

interface BranchDetailResponse {
  bmsBranchDetail: IBranch;
}

interface BranchDetailVariables {
  id: string;
}

export const useBranchDetail = (variables: BranchDetailVariables) => {
  const { data, loading, error } = useQuery<
    BranchDetailResponse,
    BranchDetailVariables
  >(BRANCH_LIST_DETAIL, {
    variables,
    skip: !variables.id,
    fetchPolicy: 'cache-and-network',
  });

  const branchDetail = data?.bmsBranchDetail;

  return { branchDetail, loading, error };
};
