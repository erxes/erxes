import {
  MutationHookOptions,
  OperationVariables,
  useMutation,
} from '@apollo/client';

import { useToast } from 'erxes-ui';
import { TPositionForm } from '../types/position';
import { ADD_POSITION, EDIT_POSITION, REMOVE_POSITIONS } from '../graphql';

interface AddPositionResult {
  positionsAdd: TPositionForm;
}

export function usePositionAdd(
  options?: MutationHookOptions<AddPositionResult, any>,
) {
  const [handleAdd, { loading, error }] = useMutation(ADD_POSITION, {
    ...options,
    refetchQueries: ['Positions'],
  });

  return {
    handleAdd,
    loading,
    error,
  };
}

export function usePositionEdit(
  options?: MutationHookOptions<AddPositionResult, any>,
) {
  const [handleEdit, { loading, error }] = useMutation(EDIT_POSITION, {
    ...options,
  });

  return {
    handleEdit,
    loading,
    error,
  };
}

export function useRemovePosition() {
  const { toast } = useToast();
  const [handleRemove, { loading, error }] = useMutation(REMOVE_POSITIONS, {
    onCompleted: () =>
      toast({ title: 'Removed successfully!', variant: 'success' }),
    refetchQueries: ['Positions'],
  });

  return {
    handleRemove,
    loading,
    error,
  };
}

export function usePositionInlineEdit() {
  const [_positionsEdit, { loading }] = useMutation(EDIT_POSITION);
  const { toast } = useToast();

  const positionsEdit = (
    operationVariables: OperationVariables,
    fields: string[],
  ) => {
    const variables = operationVariables?.variables || {};
    const fieldsToUpdate: Record<string, () => any> = {};
    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });
    return _positionsEdit({
      ...operationVariables,
      variables,
      update: (cache, { data: { positionsEdit } }) => {
        cache.modify({
          id: cache.identify(positionsEdit),
          fields: fieldsToUpdate,
        });
      },
      onCompleted: (data) => {
        if (data?.positionsEdit) {
          toast({
            title: `Position ${data.positionsEdit.code} updated successfully.`,
          });
        }
      },
    });
  };
  return { positionsEdit, loading };
}
