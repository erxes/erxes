import { useMutation } from '@apollo/client';
import { CREATE_BRANCH } from '@/tms/graphql/mutation';
import { IBranch } from '../types/branch';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { BmsBranchAddMutationVariables } from '~/gql/graphql';

interface UseBranchDuplicateOptions {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useBranchDuplicate = (options?: UseBranchDuplicateOptions) => {
  const { t } = useTranslation('tourism');
  const [createBranch, { loading }] = useMutation(CREATE_BRANCH);

  const duplicateBranch = async (variables: {
    variables: BmsBranchAddMutationVariables;
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
    refetch?: () => Promise<unknown>,
  ) => {
    const prepaid = branch.prepaid ?? false;

    try {
      await duplicateBranch({
        variables: {
          name: `${branch.name} (Copy)`,
          generalManagerIds: branch.generalManagerIds || [],
          managerIds: branch.managerIds || [],
          paymentIds: branch.paymentIds || [],
          prepaid,
          prepaidPercent: prepaid ? branch.prepaidPercent : undefined,
          erxesAppToken: branch.erxesAppToken,
          permissionConfig: branch.permissionConfig || [],
          uiOptions: branch.uiOptions || {},
        },
        onCompleted: async () => {
          toast({
            title: t('branch-duplicated-successfully'),
          });
          if (refetch) {
            await refetch();
          }
        },
      });
    } catch (error) {
      toast({
        title: t('failed-to-duplicate-branch'),
        description:
          error instanceof Error ? error.message : t('unknown-error-occurred'),
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
