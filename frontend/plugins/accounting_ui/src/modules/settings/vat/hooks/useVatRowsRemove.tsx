import { useMutation } from '@apollo/client';
import { VAT_ROWS_REMOVE } from '../graphql/mutations/vatMutations';

export const useVatRowsRemove = () => {
  const [removeVatRows, { loading }] = useMutation(
    VAT_ROWS_REMOVE,
    {
      refetchQueries: ['vatRows'],
    },
  );

  return {
    removeVatRows,
    loading,
  };
};
