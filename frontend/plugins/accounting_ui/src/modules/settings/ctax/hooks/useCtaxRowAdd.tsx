import { OperationVariables, useMutation } from '@apollo/client';
import { CTAX_ROWS_ADD } from '../graphql/mutations/ctaxMutations';
import { ICtaxRow } from '../types/CtaxRow';
import { CTAX_ROW_DEFAULT_VARIABLES } from '../constants/ctaxRowDefaultVariables';
import { GET_CTAXS } from '../graphql/queries/getCtaxs';

export const useAddCtaxRow = () => {
  const [_addCtax, { loading }] = useMutation(CTAX_ROWS_ADD);

  const addCtax = (options?: OperationVariables) => {
    _addCtax({
      ...options,
      variables: { ...options?.variables },
      update: (cache, { data }) => {
        const existingData = cache.readQuery<{
          ctaxRows: ICtaxRow[];
          ctaxRowsCount: number;
        }>({
          query: GET_CTAXS,
          variables: CTAX_ROW_DEFAULT_VARIABLES,
        });
        if (!existingData || !existingData.ctaxRows) return;

        cache.writeQuery({
          query: GET_CTAXS,
          variables: CTAX_ROW_DEFAULT_VARIABLES,
          data: {
            ctaxRows: [data.ctaxRowsAdd, ...existingData.ctaxRows],
            ctaxRowsCount: existingData.ctaxRowsCount + 1,
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
