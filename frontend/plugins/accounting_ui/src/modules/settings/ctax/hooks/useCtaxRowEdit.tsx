import { useMutation } from '@apollo/client';
import { CTAX_ROWS_EDIT } from '../graphql/mutations/ctaxMutations';

export const useCtaxRowEdit = () => {
  const [editCtaxRow, { loading }] = useMutation(
    CTAX_ROWS_EDIT,
    {
      refetchQueries: ['ctaxRows'],
    },
  );

  return {
    editCtaxRow,
    loading,
  };
};
