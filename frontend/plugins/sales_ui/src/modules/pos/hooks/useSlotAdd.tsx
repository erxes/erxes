import { MutationHookOptions, useMutation } from '@apollo/client';
import {
  PosSlotBulkUpdateMutation,
  PosSlotBulkUpdateMutationVariables,
} from '~/gql/graphql';
import { mutations } from '../graphql';

export function useUpdatePosSlots(
  options?: MutationHookOptions<
    PosSlotBulkUpdateMutation,
    PosSlotBulkUpdateMutationVariables
  >,
) {
  const [updatePosSlots, { loading, error }] = useMutation(
    mutations.saveSlots,
    {
      ...options,
    },
  );

  return { updatePosSlots, loading, error };
}
