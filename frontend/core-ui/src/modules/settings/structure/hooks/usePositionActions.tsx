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
  options?: MutationHookOptions<AddPositionResult, OperationVariables>,
) {
  const [handleAdd, { loading, error }] = useMutation(ADD_POSITION, {
    ...options,
    refetchQueries: ['Positions', 'StructureChartPositions'],
  });

  return {
    handleAdd,
    loading,
    error,
  };
}

export function usePositionEdit(
  options?: MutationHookOptions<AddPositionResult, OperationVariables>,
) {
  const [handleEdit, { loading, error }] = useMutation(EDIT_POSITION, {
    ...options,
    refetchQueries: ['Positions', 'StructureChartPositions'],
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
    refetchQueries: ['Positions', 'StructureChartPositions'],
  });

  return {
    handleRemove,
    loading,
    error,
  };
}
