import { MutationHookOptions, useMutation } from '@apollo/client';
import { mutations } from '../graphql';
import { AddPosDetailResult, AddPosDetailVariables } from '../types/mutations';

export function usePosAdd(
  options?: MutationHookOptions<AddPosDetailResult, AddPosDetailVariables>,
) {
  const [posAdd, { loading, error }] = useMutation<
    AddPosDetailResult,
    AddPosDetailVariables
  >(mutations.posAdd, {
    ...options,
    refetchQueries: ['posList'],
  });

  return { posAdd, loading, error };
}
