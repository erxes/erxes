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
    try {
      const success = await removeBranchById(branchId);

      if (success) {
        if (refetch) {
          try {
            await refetch();
          } catch (error) {
            showToast.error(error instanceof Error ? error.message : undefined);
            return;
          }
        }
        showToast.success();
      } else {
        showToast.error();
      }
    } catch (error) {
      console.error('Error during branch deletion or refetch:', error);
      showToast.error();
    }
  };

  return {
    removeBranchById,
    handleDeleteBranch,
    loading,
  };
};
