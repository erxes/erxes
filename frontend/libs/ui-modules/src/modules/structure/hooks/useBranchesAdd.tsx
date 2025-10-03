import { MutationHookOptions, useMutation } from '@apollo/client';
import { BRANCHES_ADD } from '../graphql/mutations/addBranches';

export const useBranchesAdd = () => {
  const [branchesAdd, { loading }] = useMutation(BRANCHES_ADD);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    branchesAdd({
      ...options,
      variables,
      refetchQueries: ['BranchesMain'],
    });
  };

  return { branchesAdd: mutate, loading };
};
