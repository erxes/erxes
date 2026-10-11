import type { QueryHookOptions } from '@apollo/client';
import type { ResultOf, VariablesOf } from '@graphql-typed-document-node/core';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { GET_VATS, SELECT_VATS } from '../graphql/queries/getVats';
import {
  VAT_ROW_DEFAULT_VARIABLES,
  VAT_ROW_PER_PAGE,
} from '../constants/vatRowDefaultVariables';

export const useVatRows = (
  options?: QueryHookOptions<
    ResultOf<typeof GET_VATS | typeof SELECT_VATS>,
    VariablesOf<typeof GET_VATS>
  >,
  inSelect?: boolean,
) => {
  const {
    data: queryData,
    loading,
    fetchMore,
    error,
  } = useQuery(inSelect ? SELECT_VATS : GET_VATS, {
    onError: () => {
      // Do nothing
    },
    ...options,
    variables: {
      ...VAT_ROW_DEFAULT_VARIABLES,
      ...options?.variables,
    },
  });
  const data = toGraphqlView(queryData);

  const { vatRows, vatRowsCount } = data || {};

  const handleFetchMore = () => {
    if (!vatRows) return;

    fetchMore({
      variables: {
        page: Math.ceil(vatRows.length / VAT_ROW_PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        return {
          ...prev,
          vatRows: [
            ...(prev.vatRows ?? []),
            ...(fetchMoreResult.vatRows ?? []),
          ],
        };
      },
    });
  };

  return {
    vatRows,
    totalCount: vatRowsCount,
    loading,
    error,
    handleFetchMore,
  };
};
