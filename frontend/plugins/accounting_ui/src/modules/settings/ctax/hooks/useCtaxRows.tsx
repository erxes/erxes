import type { QueryHookOptions } from '@apollo/client';
import type { ResultOf, VariablesOf } from '@graphql-typed-document-node/core';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { GET_CTAXS, SELECT_CTAXS } from '../graphql/queries/getCtaxs';
import {
  CTAX_ROW_DEFAULT_VARIABLES,
  CTAX_ROW_PER_PAGE,
} from '../constants/ctaxRowDefaultVariables';

export const useCtaxRows = (
  options?: QueryHookOptions<
    ResultOf<typeof GET_CTAXS | typeof SELECT_CTAXS>,
    VariablesOf<typeof GET_CTAXS>
  >,
  inSelect?: boolean,
) => {
  const {
    data: queryData,
    loading,
    fetchMore,
    error,
  } = useQuery(inSelect ? SELECT_CTAXS : GET_CTAXS, {
    onError: () => {
      // Do nothing
    },
    ...options,
    variables: {
      ...CTAX_ROW_DEFAULT_VARIABLES,
      ...options?.variables,
    },
  });
  const data = toGraphqlView(queryData);

  const { ctaxRows, ctaxRowsCount } = data || {};

  const handleFetchMore = () => {
    if (!ctaxRows) return;

    fetchMore({
      variables: {
        page: Math.ceil(ctaxRows.length / CTAX_ROW_PER_PAGE) + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        return {
          ...prev,
          ctaxRows: [
            ...(prev.ctaxRows ?? []),
            ...(fetchMoreResult.ctaxRows ?? []),
          ],
        };
      },
    });
  };

  return {
    ctaxRows,
    totalCount: ctaxRowsCount,
    loading,
    error,
    handleFetchMore,
  };
};
