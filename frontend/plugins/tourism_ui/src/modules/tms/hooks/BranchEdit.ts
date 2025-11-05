import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { EDIT_BRANCH } from '@/tms/graphql/mutation';
import { IBranch } from '../types/branch';

export interface IUpdateBranchVariables {
  id: string;
  name?: string;
  description?: string;
  generalManagerIds?: string[];
  managerIds?: string[];
  paymentIds?: string[];
  paymentTypes?: any[];
  departmentId?: string;
  token?: string;
  erxesAppToken?: string;
  permissionConfig?: {
    _id?: string;
    type: string;
    title: string;
    icon: string;
    config?: string;
  }[];
  uiOptions?: {
    logo?: string;
    favIcon?: string;
    colors?: {
      primary?: string;
    };
  };
}

interface UpdateBranchResponse {
  bmsBranchEdit: IBranch;
}

interface UseBranchEditOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useBranchEdit = (options?: UseBranchEditOptions) => {
  const [editingBranch, setEditingBranch] = useState<string | null>(null);

  const [updateBranchMutation, { loading }] = useMutation<
    UpdateBranchResponse,
    IUpdateBranchVariables
  >(EDIT_BRANCH);

  const editBranch = (mutationOptions: {
    variables: IUpdateBranchVariables;
    onCompleted?: (data: UpdateBranchResponse) => void;
  }) => {
    return updateBranchMutation({
      ...mutationOptions,
      onError: (error: unknown) => {
        options?.onError?.(error);
      },
    });
  };

  const handleUpdateBranch = async (
    branchData: IUpdateBranchVariables,
    refetch?: () => Promise<any>,
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
