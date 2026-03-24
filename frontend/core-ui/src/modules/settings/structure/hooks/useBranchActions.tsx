import {
  ApolloCache,
  MutationHookOptions,
  OperationVariables,
  useMutation,
} from '@apollo/client';
import {
  ADD_BRANCH,
  EDIT_BRANCH,
  GET_BRANCHES_LIST,
  REMOVE_BRANCHES,
} from '../graphql';
import { IBranchListItem, TBranchForm } from '../types/branch';
import { useToast } from 'erxes-ui';

interface BranchData {
  branchesMain: {
    list: IBranchListItem[];
    totalCount: number;
  };
}
interface AddBranchResult {
  branchesAdd: TBranchForm;
}

export function useBranchAdd(
  options?: MutationHookOptions<AddBranchResult, any>,
) {
  const { toast } = useToast();
  const [handleAdd, { loading, error }] = useMutation(ADD_BRANCH, {
    ...options,
    update: (cache: ApolloCache<any>, { data }) => {
      try {
        const existingData = cache.readQuery<BranchData>({
          query: GET_BRANCHES_LIST,
        });
        if (!existingData || !existingData.branchesMain || !data?.branchesAdd)
          return;

        cache.writeQuery<BranchData>({
          query: GET_BRANCHES_LIST,
          data: {
            branchesMain: {
              ...existingData.branchesMain,
              list: [data.branchesAdd, ...existingData.branchesMain.list],
              totalCount: existingData.branchesMain.totalCount + 1,
            },
          },
        });
      } catch (e) {
        // Silently handle cache update errors
      }
    },
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
  const { toast } = useToast();
  const [handleEdit, { loading, error }] = useMutation(EDIT_BRANCH, {
    ...options,
    update: (cache: ApolloCache<any>, { data }) => {
      try {
        const existingData = cache.readQuery<BranchData>({
          query: GET_BRANCHES_LIST,
        });
        if (!existingData || !existingData.branchesMain || !data?.branchesEdit)
          return;

        cache.writeQuery<BranchData>({
          query: GET_BRANCHES_LIST,
          data: {
            branchesMain: {
              ...existingData.branchesMain,
              list: [data.branchesEdit, ...existingData.branchesMain.list],
              totalCount: existingData.branchesMain.totalCount + 1,
            },
          },
        });
      } catch (e) {
        // Silently handle cache update errors
      }
    },
  });

  return {
    handleEdit,
    loading,
    error,
  };
}

export function useRemoveBranch() {
  const { toast } = useToast();
  const [handleRemove, { loading, error }] = useMutation(REMOVE_BRANCHES, {
    onCompleted: () =>
      toast({ title: 'Removed successfully!', variant: 'success' }),
    refetchQueries: ['Branches'],
  });

  return {
    handleRemove,
    loading,
    error,
  };
}

export function useBranchInlineEdit() {
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
            title: 'Branch updated successfully!',
            variant: 'success',
          });
        }
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };
  return { branchesEdit, loading };
}
