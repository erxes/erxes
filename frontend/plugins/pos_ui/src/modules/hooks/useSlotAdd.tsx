import { useMutation, MutationHookOptions } from '@apollo/client';
import { mutations } from '../graphql';
import { PosSlotBulkUpdateResult, PosSlotBulkUpdateVariables } from '../types/slot';

export function useUpdatePosSlots(
  options?: MutationHookOptions<PosSlotBulkUpdateResult, PosSlotBulkUpdateVariables>,
) {
  const [updatePosSlots, { loading, error }] = useMutation<
    PosSlotBulkUpdateResult,
    PosSlotBulkUpdateVariables
  >(mutations.saveSlots, {
    ...options,
  });

  return { updatePosSlots, loading, error };
}
