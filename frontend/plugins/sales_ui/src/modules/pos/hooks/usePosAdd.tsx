import { MutationHookOptions, useApolloClient, useMutation } from '@apollo/client';
import { mutations } from '../graphql';
import { AddPosDetailResult, AddPosDetailVariables } from '../types/mutations';
import { getSalesRefetchQueries } from '~/utils/getSalesRefetchQueries';

export function usePosAdd(
  options?: MutationHookOptions<AddPosDetailResult, AddPosDetailVariables>,
) {
  const client = useApolloClient();
  const [posAdd, { loading, error }] = useMutation<
    AddPosDetailResult,
    AddPosDetailVariables
  >(mutations.posAdd, {
    ...options,
    refetchQueries: () => getSalesRefetchQueries(client, 'posList'),
  });

  return { posAdd, loading, error };
}
