import { useMutation } from '@apollo/client';
import { REMOVE_BRANCH } from '../graphql/mutation';
import { GET_BRANCH_LIST } from '../graphql/queries';
import { IBranchRemoveResponse, IBranchRemoveVariables } from '../types/branch';

export const useBranchRemove = () => {
  const [removeBranch, { loading, error }] = useMutation<
    IBranchRemoveResponse,
    IBranchRemoveVariables
  >(REMOVE_BRANCH, {
    refetchQueries: [{ query: GET_BRANCH_LIST }],
    onError: (error) => {
      console.error('Error removing branch:', error);
    },
  });

  const removeBranchById = async (branchId: string) => {
    try {
      const response = await removeBranch({
        variables: { id: branchId },
      });

      return response.data?.bmsBranchRemove || false;
    } catch (error) {
      return false;
    }
  };

  return { removeBranchById, loading, error };
};
