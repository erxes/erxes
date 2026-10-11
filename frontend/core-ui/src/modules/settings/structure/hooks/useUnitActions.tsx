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

export function useUnitAdd(options?: MutationHookOptions<AddUnitResult, OperationVariables>) {
  const [handleAdd, { loading, error }] = useMutation(ADD_UNIT, {
    ...options,
    refetchQueries: ['StructureChartUnits'],
  });

  return {
    handleAdd,
    loading,
    error,
  };
}

export function useUnitEdit(options?: MutationHookOptions<AddUnitResult, OperationVariables>) {
  const [handleEdit, { loading, error }] = useMutation(EDIT_UNIT, {
    ...options,
    refetchQueries: ['StructureChartUnits'],
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
    refetchQueries: ['StructureChartUnits'],
  });

  return {
    handleRemove,
    loading,
    error,
  };
}
