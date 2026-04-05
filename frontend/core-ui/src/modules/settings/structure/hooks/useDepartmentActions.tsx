import {
  MutationHookOptions,
  OperationVariables,
  useMutation,
} from '@apollo/client';

import { useToast } from 'erxes-ui';
import { TDepartmentForm } from '../types/department';
import {
  ADD_DEPARTMENT,
  EDIT_DEPARTMENT,
  REMOVE_DEPARTMENTS,
} from '../graphql';

interface AddDepartmentResult {
  departmentsAdd: TDepartmentForm;
}

export function useDepartmentAdd(
  options?: MutationHookOptions<AddDepartmentResult, any>,
) {
  const [handleAdd, { loading, error }] = useMutation(ADD_DEPARTMENT, {
    ...options,
    refetchQueries: ['Departments'],
  });

  return {
    handleAdd,
    loading,
    error,
  };
}

export function useDepartmentEdit(
  options?: MutationHookOptions<AddDepartmentResult, any>,
) {
  const [handleEdit, { loading, error }] = useMutation(EDIT_DEPARTMENT, {
    ...options,
  });

  return {
    handleEdit,
    loading,
    error,
  };
}

export function useRemoveDepartment() {
  const { toast } = useToast();
  const [handleRemove, { loading, error }] = useMutation(REMOVE_DEPARTMENTS, {
    onCompleted: () =>
      toast({ title: 'Removed successfully!', variant: 'success' }),
    refetchQueries: ['Departments'],
  });

  return {
    handleRemove,
    loading,
    error,
  };
}

export function useDepartmentInlineEdit() {
  const [_departmentsEdit, { loading }] = useMutation(EDIT_DEPARTMENT);
  const { toast } = useToast();

  const departmentsEdit = (
    operationVariables: OperationVariables,
    fields: string[],
  ) => {
    const { variables } = operationVariables || {};

    const fieldsToUpdate: Record<string, () => any> = {};
    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });
    return _departmentsEdit({
      ...operationVariables,
      update: (cache, { data }) => {
        if (!data?.departmentsEdit) return;
        const { departmentsEdit } = data;
        cache.modify({
          id: cache.identify(departmentsEdit),
          fields: fieldsToUpdate,
        });
      },
      onCompleted: (data) => {
        if (data?.departmentsEdit) {
          toast({
            title: 'Department updated successfully!',
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

  return { departmentsEdit, loading };
}
