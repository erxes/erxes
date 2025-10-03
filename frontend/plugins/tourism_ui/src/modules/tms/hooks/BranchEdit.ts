import { useQuery } from '@apollo/client';
import { EDIT_BRANCH_LIST } from '../graphql/mutation';
import { IBranch } from '../types/branch';

interface BranchListResponse {
  bmsBranchList: IBranch[];
}

export const useBranchEdit = () => {
  const { data, loading, error } =
    useQuery<BranchListResponse>(EDIT_BRANCH_LIST);

  const list = data?.bmsBranchList || [];

  return { list, loading, error };
};
