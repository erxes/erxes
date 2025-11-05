import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { EDIT_BRANCH } from '@/tms/graphql/mutation';
import { toast } from 'erxes-ui';

interface UpdateBranchVariables {
  id: string;
  name?: string;
  description?: string;
  generalManagerIds?: string[];
  managerIds?: string[];
  paymentIds?: string[];
  paymentTypes?: any[];
  erxesAppToken?: string;
  permissionConfig?: any;
  uiOptions?: any;
}

interface UseBranchEditOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useBranchEdit = (options?: UseBranchEditOptions) => {
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  const [updateBranch, { loading }] = useMutation(EDIT_BRANCH);

  const updateBranchById = async (variables: UpdateBranchVariables) => {
    try {
      const result = await updateBranch({
        variables,
      });

      if (result.data) {
        options?.onSuccess?.();
        return result.data;
      }
      return null;
    } catch (error) {
      options?.onError?.(error);
      throw error;
    }
  };

  const editBranch = async ({
    variables,
    onError,
    onCompleted,
  }: {
    variables: UpdateBranchVariables;
    onError?: (error: any) => void;
    onCompleted?: () => void;
  }) => {
    try {
      const result = await updateBranch({
        variables,
      });

      if (result.data) {
        onCompleted?.();
        options?.onSuccess?.();
        return result.data;
      }
      return null;
    } catch (error) {
      onError?.(error);
      options?.onError?.(error);
      throw error;
    }
  };

  const handleEditBranch = (branchId: string) => {
    setEditingBranch(branchId);
  };

  const handleUpdateBranch = async (
    branchData: UpdateBranchVariables,
    refetch?: () => Promise<any>,
  ) => {
    try {
      await updateBranchById(branchData);

      toast({
        title: 'Branch updated successfully',
      });

      if (refetch) {
        await refetch();
      }

      setEditingBranch(null);
    } catch (error) {
      toast({
        title: 'Failed to update branch',
        description: error?.message || 'Unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const closeEditDialog = () => {
    setEditingBranch(null);
  };

  return {
    editingBranch,
    updateBranchById,
    editBranch,
    handleEditBranch,
    handleUpdateBranch,
    closeEditDialog,
    loading,
  };
};
