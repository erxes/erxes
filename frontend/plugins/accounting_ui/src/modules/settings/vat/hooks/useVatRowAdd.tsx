import { OperationVariables, useMutation } from '@apollo/client';
import { VAT_ROWS_ADD } from '../graphql/mutations/vatMutations';
import { IVatRow } from '../types/VatRow';
import { VAT_ROW_DEFAULT_VARIABLES } from '../constants/vatRowDefaultVariables';
import { GET_VATS } from '../graphql/queries/getVats';

export const useAddVatRow = () => {
  const [_addVat, { loading }] = useMutation(VAT_ROWS_ADD);

  const addVat = (options?: OperationVariables) => {
    _addVat({
      ...options,
      variables: { ...options?.variables },
      update: (cache, { data }) => {
        const existingData = cache.readQuery<{
          vatRows: IVatRow[];
          vatRowsCount: number;
        }>({
          query: GET_VATS,
          variables: VAT_ROW_DEFAULT_VARIABLES,
        });
        if (!existingData || !existingData.vatRows) return;

        cache.writeQuery({
          query: GET_VATS,
          variables: VAT_ROW_DEFAULT_VARIABLES,
          data: {
            vatRows: [data.vatRowsAdd, ...existingData.vatRows],
            vatRowsCount: existingData.vatRowsCount + 1,
          },
        });
      },
    });
  };

  return {
    addVat,
    loading,
  };
};
