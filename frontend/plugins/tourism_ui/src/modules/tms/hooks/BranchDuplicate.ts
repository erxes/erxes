import { useMutation } from '@apollo/client';
import { CREATE_BRANCH } from '@/tms/graphql/mutation';
import { IBranch } from '../types/branch';
import { toast } from 'erxes-ui';

interface DuplicateBranchVariables {
  name: string;
  description?: string;
  generalManagerIds?: string[];
  managerIds?: string[];
  paymentIds?: string[];
  paymentTypes?: any[];
  erxesAppToken?: string;
  permissionConfig?: any[];
  uiOptions?: Record<string, any>;
}

interface UseBranchDuplicateOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useBranchDuplicate = (options?: UseBranchDuplicateOptions) => {
  const [createBranch, { loading }] = useMutation(CREATE_BRANCH);

  const duplicateBranch = async (variables: {
    variables: DuplicateBranchVariables;
    onCompleted?: () => void;
  }) => {
    try {
      await createBranch({
        variables: variables.variables,
        onCompleted: () => {
          variables.onCompleted?.();
          options?.onSuccess?.();
        },
      });
    } catch (error) {
      options?.onError?.(error);
      throw error;
    }
  };

  const handleDuplicateBranch = async (
    branch: IBranch,
    refetch?: () => Promise<any>,
  ) => {
    try {
      await duplicateBranch({
        variables: {
          name: `${branch.name} (Copy)`,
          description: branch.description,
          generalManagerIds: branch.generalManagerIds || [],
          managerIds: branch.managerIds || [],
          paymentIds: branch.paymentIds || [],
          paymentTypes: branch.paymentTypes || [],
          erxesAppToken: branch.erxesAppToken,
          permissionConfig: branch.permissionConfig || [],
          uiOptions: branch.uiOptions || {},
        },
        onCompleted: async () => {
          toast({
            title: 'Branch duplicated successfully',
          });
          if (refetch) {
            await refetch();
          }
        },
      });
    } catch (error) {
      toast({
        title: 'Failed to duplicate branch',
        description: error?.message || 'Unknown error occurred',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    duplicateBranch,
    handleDuplicateBranch,
    loading,
  };
};
