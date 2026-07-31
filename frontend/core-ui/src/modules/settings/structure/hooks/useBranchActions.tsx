import {
  MutationHookOptions,
  OperationVariables,
  useMutation,
} from '@apollo/client';
import { ADD_BRANCH, EDIT_BRANCH, REMOVE_BRANCHES } from '../graphql';
import { TBranchForm } from '../types/branch';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface AddBranchResult {
  branchesAdd: TBranchForm;
}

export function useBranchAdd(
  options?: MutationHookOptions<AddBranchResult, any>,
) {
  const [handleAdd, { loading, error }] = useMutation(ADD_BRANCH, {
    ...options,
    refetchQueries: ['Branches'],
  });

  return {
    handleAdd,
    loading,
    error,
  };
}

export function useBranchEdit(
  options?: MutationHookOptions<AddBranchResult, any>,
) {
  const [handleEdit, { loading, error }] = useMutation(EDIT_BRANCH, {
    ...options,
    refetchQueries: ['Branches'],
  });

  return {
    handleEdit,
    loading,
    error,
  };
}

export function useRemoveBranch() {
  const { toast } = useToast();
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const [handleRemove, { loading, error }] = useMutation(REMOVE_BRANCHES, {
    onCompleted: () =>
      toast({
        title: t('removed-successfully', 'Removed successfully!'),
        variant: 'success',
      }),
    refetchQueries: ['Branches'],
  });

  return {
    handleRemove,
    loading,
    error,
  };
}

export function useBranchInlineEdit() {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const [_branchesEdit, { loading }] = useMutation(EDIT_BRANCH);
  const { toast } = useToast();

  const branchesEdit = (
    operationVariables: OperationVariables,
    fields: string[],
  ) => {
    const { variables } = operationVariables || {};

    const fieldsToUpdate: Record<string, () => any> = {};
    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });
    return _branchesEdit({
      ...operationVariables,
      update: (cache, { data }) => {
        if (!data?.branchesEdit) return;
        const { branchesEdit } = data;
        cache.modify({
          id: cache.identify(branchesEdit),
          fields: fieldsToUpdate,
        });
      },
      onCompleted: (data) => {
        if (data?.branchesEdit) {
          toast({
            title: t(
              'branch-updated-successfully',
              'Branch updated successfully!',
            ),
            variant: 'success',
          });
        }
      },
      onError: (error) => {
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };
  return { branchesEdit, loading };
}
