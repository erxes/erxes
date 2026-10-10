import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { VAT_ROWS_ADD } from '../graphql/mutations/vatMutations';

import { VAT_ROW_DEFAULT_VARIABLES } from '../constants/vatRowDefaultVariables';
import { GET_VATS } from '../graphql/queries/getVats';

export const useAddVatRow = () => {
  const [_addVat, { loading }] = useMutation(VAT_ROWS_ADD);

  const addVat = (options?: GraphqlMutationOptions<typeof VAT_ROWS_ADD>) => {
    _addVat({
      ...options,
      variables: { ...options?.variables },
      update: (cache, { data }) => {
        const existingData = cache.readQuery({
          query: GET_VATS,
          variables: VAT_ROW_DEFAULT_VARIABLES,
        });
        if (!existingData?.vatRows || !data?.vatRowsAdd) return;

        cache.writeQuery({
          query: GET_VATS,
          variables: VAT_ROW_DEFAULT_VARIABLES,
          data: {
            vatRows: [data.vatRowsAdd, ...existingData.vatRows],
            vatRowsCount: (existingData.vatRowsCount ?? 0) + 1,
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
