import { MutationHookOptions, useMutation } from '@apollo/client';
import { POSITIONS_ADD } from '../graphql/mutations/addPositions';

export const usePositionsAdd = () => {
  const [positionsAdd, { loading }] = useMutation(POSITIONS_ADD);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    positionsAdd({
      ...options,
      variables,
      refetchQueries: ['Positions'],
    });
  };

  return { positionsAdd: mutate, loading };
};
