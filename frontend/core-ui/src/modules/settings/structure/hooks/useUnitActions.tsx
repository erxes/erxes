import {
  MutationHookOptions,
  OperationVariables,
  useMutation,
} from '@apollo/client';

import { useToast } from 'erxes-ui';
import { TUnitForm } from '../types/unit';
import {
  ADD_UNIT,
  EDIT_UNIT,
  REMOVE_UNITS,
} from '../graphql/mutations/unitMutations';

interface AddUnitResult {
  unitsAdd: TUnitForm;
}

export function useUnitAdd(options?: MutationHookOptions<AddUnitResult, any>) {
  const [handleAdd, { loading, error }] = useMutation(ADD_UNIT, {
    ...options,
    refetchQueries: ['Units'],
  });

  return {
    handleAdd,
    loading,
    error,
  };
}

export function useUnitEdit(options?: MutationHookOptions<AddUnitResult, any>) {
  const [handleEdit, { loading, error }] = useMutation(EDIT_UNIT, {
    ...options,
  });

  return {
    handleEdit,
    loading,
    error,
  };
}

export function useRemoveUnit() {
  const { toast } = useToast();
  const [handleRemove, { loading, error }] = useMutation(REMOVE_UNITS, {
    onCompleted: () =>
      toast({ title: 'Removed successfully!', variant: 'success' }),
    refetchQueries: ['Units'],
  });

  return {
    handleRemove,
    loading,
    error,
  };
}

export function useUnitInlineEdit() {
  const [_unitsEdit, { loading }] = useMutation(EDIT_UNIT);
  const { toast } = useToast();

  const unitsEdit = (
    operationVariables: OperationVariables,
    fields: string[],
  ) => {
    const { variables } = operationVariables || {};

    const fieldsToUpdate: Record<string, () => any> = {};
    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });
    return _unitsEdit({
      ...operationVariables,
      update: (cache, { data }) => {
        if (!data?.unitsEdit) return;
        const { unitsEdit } = data;
        cache.modify({
          id: cache.identify(unitsEdit),
          fields: fieldsToUpdate,
        });
      },
      onCompleted: (data) => {
        if (data?.unitsEdit) {
          toast({
            title: 'Unit updated successfully!',
            variant: 'success',
          });
        }
      },
      onError: (error) => {
        toast({
          title: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { unitsEdit, loading };
}
