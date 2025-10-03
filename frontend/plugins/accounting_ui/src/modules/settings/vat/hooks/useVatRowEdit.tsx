import { useMutation } from '@apollo/client';
import { VAT_ROWS_EDIT } from '../graphql/mutations/vatMutations';

export const useVatRowEdit = () => {
  const [editVatRow, { loading }] = useMutation(
    VAT_ROWS_EDIT,
    {
      refetchQueries: ['vatRows'],
    },
  );

  return {
    editVatRow,
    loading,
  };
};
