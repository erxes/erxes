import {
  ApolloCache,
  MutationHookOptions,
  OperationVariables,
  useMutation,
} from '@apollo/client';

import { useToast } from 'erxes-ui';
import { IDepartmentListItem, TDepartmentForm } from '../types/department';
import {
  ADD_DEPARTMENT,
  EDIT_DEPARTMENT,
  GET_DEPARTMENTS_LIST,
  REMOVE_DEPARTMENTS,
} from '../graphql';

interface DepartmentData {
  departmentsMain: {
    list: IDepartmentListItem[];
    totalCount: number;
  };
}
interface AddDepartmentResult {
  departmentsAdd: TDepartmentForm;
}

export function useDepartmentAdd(
  options?: MutationHookOptions<AddDepartmentResult, any>,
) {
  const { toast } = useToast();
  const [handleAdd, { loading, error }] = useMutation(ADD_DEPARTMENT, {
    ...options,
    update: (cache: ApolloCache<any>, { data }) => {
      try {
        const existingData = cache.readQuery<DepartmentData>({
          query: GET_DEPARTMENTS_LIST,
        });
        if (
          !existingData ||
          !existingData.departmentsMain ||
          !data?.departmentsAdd
        )
          return;

        cache.writeQuery<DepartmentData>({
          query: GET_DEPARTMENTS_LIST,
          data: {
            departmentsMain: {
              ...existingData.departmentsMain,
              list: [data.departmentsAdd, ...existingData.departmentsMain.list],
              totalCount: existingData.departmentsMain.totalCount + 1,
            },
          },
        });
      } catch (e) {
        // Error handled silently
      }
    },
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
  const { toast } = useToast();
  const [handleEdit, { loading, error }] = useMutation(EDIT_DEPARTMENT, {
    ...options,
    update: (cache: ApolloCache<any>, { data }) => {
      try {
        const existingData = cache.readQuery<DepartmentData>({
          query: GET_DEPARTMENTS_LIST,
        });
        if (
          !existingData ||
          !existingData.departmentsMain ||
          !data?.departmentsEdit
        )
          return;

        cache.writeQuery<DepartmentData>({
          query: GET_DEPARTMENTS_LIST,
          data: {
            departmentsMain: {
              ...existingData.departmentsMain,
              list: [
                data.departmentsEdit,
                ...existingData.departmentsMain.list,
              ],
              totalCount: existingData.departmentsMain.totalCount + 1,
            },
          },
        });
      } catch (e) {
        // Error handled silently
      }
    },
  });
}
    },
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
