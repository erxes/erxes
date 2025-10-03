import { useMutation } from '@apollo/client';
import { CTAX_ROWS_REMOVE } from '../graphql/mutations/ctaxMutations';

export const useCtaxRowsRemove = () => {
  const [removeCtaxRows, { loading }] = useMutation(
    CTAX_ROWS_REMOVE,
    {
      refetchQueries: ['ctaxRows'],
    },
  );

  return {
    removeCtaxRows,
    loading,
  };
};
