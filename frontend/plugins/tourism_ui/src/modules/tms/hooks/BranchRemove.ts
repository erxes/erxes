import { useMutation } from '@apollo/client';
import { REMOVE_BRANCH } from '@/tms/graphql/mutation';
import { toast } from 'erxes-ui';

interface RemoveBranchVariables {
  id: string;
}

interface RemoveBranchResponse {
  bmsBranchRemove: boolean;
}

interface UseBranchRemoveOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const showToast = {
  success: () => {
    toast({
      title: 'Branch deleted successfully',
    });
  },
  error: (message?: string) => {
    toast({
      title: 'Failed to delete branch',
      description: message,
      variant: 'destructive',
    });
  },
};

export const useBranchRemove = (options?: UseBranchRemoveOptions) => {
  const [deleteBranchMutation, { loading }] = useMutation<
    RemoveBranchResponse,
    RemoveBranchVariables
  >(REMOVE_BRANCH, {
    refetchQueries: ['BmsBranchList'],
    awaitRefetchQueries: false,
  });

  const removeBranchById = async (branchId: string): Promise<boolean> => {
    try {
      const result = await deleteBranchMutation({
        variables: { id: branchId },
      });

      if (result.data?.bmsBranchRemove) {
        options?.onSuccess?.();
        return true;
      }
      return false;
    } catch (error) {
      options?.onError?.(error);
      return false;
    }
  };

  const handleDeleteBranch = async (
    branchId: string,
    refetch?: () => Promise<any>,
  ): Promise<void> => {
    const success = await removeBranchById(branchId);

    if (success) {
      showToast.success();
      if (refetch) {
        await refetch();
      }
    } else {
      showToast.error();
    }
  };

  return {
    removeBranchById,
    handleDeleteBranch,
    loading,
  };
};
