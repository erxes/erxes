import { MutationHookOptions, useMutation } from '@apollo/client';
import { mutations } from '../graphql';
import { AddPosDetailResult } from '../types/mutations';

export interface PosAddVariables {
  name?: string;
  description?: string;
  type?: string;
}

export function usePosAdd(
  options?: MutationHookOptions<AddPosDetailResult, PosAddVariables>,
) {
  const [posAdd, { loading, error }] = useMutation<
    AddPosDetailResult,
    PosAddVariables
  >(mutations.posAdd, {
    ...options,
    refetchQueries: ['posList'],
  });

  return { posAdd, loading, error };
}
