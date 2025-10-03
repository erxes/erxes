import { useQuery } from '@apollo/client';
import { GET_BRANCH_LIST } from '../graphql/queries';
import { IBranch } from '../types/branch';

interface BranchListResponse {
  bmsBranchList: IBranch[];
}

export const useBranchList = () => {
  const { data, loading, error } =
    useQuery<BranchListResponse>(GET_BRANCH_LIST);

  const list = data?.bmsBranchList || [];

  return { list, loading, error };
};
