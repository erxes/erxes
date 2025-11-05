import { useMutation } from '@apollo/client';
import { EDIT_BRANCH } from '@/tms/graphql/mutation';

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
  const [updateBranch, { loading }] = useMutation(EDIT_BRANCH);

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

  return {
    editBranch,
    loading,
  };
};
