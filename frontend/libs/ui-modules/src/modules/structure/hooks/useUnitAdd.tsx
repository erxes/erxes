import { MutationHookOptions, useMutation } from '@apollo/client';
import { UNITS_ADD } from '../graphql/mutations/addUnits';

export const useUnitAdd = () => {
  const [unitsAdd, { loading }] = useMutation(UNITS_ADD);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    unitsAdd({
      ...options,
      variables,
      refetchQueries: ['UnitsMain'],
    });
  };

  return { unitsAdd: mutate, loading };
};
