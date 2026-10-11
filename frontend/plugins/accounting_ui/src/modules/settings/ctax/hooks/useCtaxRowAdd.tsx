import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { CTAX_ROWS_ADD } from '../graphql/mutations/ctaxMutations';

import { CTAX_ROW_DEFAULT_VARIABLES } from '../constants/ctaxRowDefaultVariables';
import { GET_CTAXS } from '../graphql/queries/getCtaxs';

export const useAddCtaxRow = () => {
  const [_addCtax, { loading }] = useMutation(CTAX_ROWS_ADD);

  const addCtax = (options?: GraphqlMutationOptions<typeof CTAX_ROWS_ADD>) => {
    _addCtax({
      ...options,
      variables: { ...options?.variables },
      update: (cache, { data }) => {
        const existingData = cache.readQuery({
          query: GET_CTAXS,
          variables: CTAX_ROW_DEFAULT_VARIABLES,
        });
        if (!existingData?.ctaxRows || !data?.ctaxRowsAdd) return;

        cache.writeQuery({
          query: GET_CTAXS,
          variables: CTAX_ROW_DEFAULT_VARIABLES,
          data: {
            ctaxRows: [data.ctaxRowsAdd, ...existingData.ctaxRows],
            ctaxRowsCount: (existingData.ctaxRowsCount ?? 0) + 1,
          },
        });
      },
    });
  };

  return {
    addCtax,
    loading,
  };
};
