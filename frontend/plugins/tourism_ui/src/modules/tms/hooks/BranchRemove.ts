import { useMutation } from '@apollo/client';
import { REMOVE_BRANCH } from '@/tms/graphql/mutation';
import { toast } from 'erxes-ui';

interface UseBranchRemoveOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useBranchRemove = (options?: UseBranchRemoveOptions) => {
  const [deleteBranch, { loading }] = useMutation(REMOVE_BRANCH);

  const removeBranchById = async (branchId: string): Promise<boolean> => {
    try {
      const result = await deleteBranch({
        variables: { id: branchId },
      });

      if (result.data) {
        options?.onSuccess?.();
        return true;
      }
      return false;
    } catch (error) {
      options?.onError?.(error);
      throw error;
    }
  };

  const handleDeleteBranch = async (
    branchId: string,
    refetch?: () => Promise<any>,
  ) => {
    try {
      const success = await removeBranchById(branchId);

      if (success) {
        toast({
          title: 'Branch deleted successfully',
        });
        if (refetch) {
          await refetch();
        }
      } else {
        toast({
          title: 'Failed to delete branch',
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to delete branch',
        description: `${error.message}`,
      });
      throw error;
    }
  };

  return {
    removeBranchById,
    handleDeleteBranch,
    loading,
  };
};
