import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { EDIT_BRANCH } from '@/tms/graphql/mutation';
import type {
  BmsBranchEditMutation,
  BmsBranchEditMutationVariables,
} from '~/gql/graphql';

interface UseBranchEditOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useBranchEdit = (options?: UseBranchEditOptions) => {
  const [editingBranch, setEditingBranch] = useState<string | null>(null);

  const [updateBranchMutation, { loading }] = useMutation(EDIT_BRANCH);

  const editBranch = (mutationOptions: {
    variables: BmsBranchEditMutationVariables;
    onCompleted?: (data: BmsBranchEditMutation) => void;
    onError?: (error: unknown) => void;
  }) => {
    return updateBranchMutation({
      ...mutationOptions,
      onError: (error: unknown) => {
        mutationOptions.onError?.(error);
        options?.onError?.(error);
      },
    });
  };

  const handleUpdateBranch = async (
    branchData: BmsBranchEditMutationVariables,
    refetch?: () => Promise<unknown>,
  ) => {
    try {
      const result = await updateBranchMutation({
        variables: branchData,
      });

      if (result.data) {
        if (refetch) {
          await refetch();
        }

        setEditingBranch(null);
        options?.onSuccess?.();
        return result.data;
      }
      return null;
    } catch (error) {
      options?.onError?.(error);
      throw error;
    }
  };

  const handleEditBranch = (branchId: string) => {
    setEditingBranch(branchId);
  };

  const closeEditDialog = () => {
    setEditingBranch(null);
  };

  return {
    editingBranch,
    editBranch,
    handleEditBranch,
    handleUpdateBranch,
    closeEditDialog,
    loading,
  };
};
