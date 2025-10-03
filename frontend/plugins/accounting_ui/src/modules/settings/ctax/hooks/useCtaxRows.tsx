import { OperationVariables, useQuery } from '@apollo/client';
import { GET_CTAXS, SELECT_CTAXS } from '../graphql/queries/getCtaxs';
import {
  CTAX_ROW_DEFAULT_VARIABLES,
  CTAX_ROW_PER_PAGE,
} from '../constants/ctaxRowDefaultVariables';
import { ICtaxRow } from '../types/CtaxRow';

export const useCtaxRows = (
  options?: OperationVariables,
  inSelect?: boolean,
) => {
  const { data, loading, fetchMore, error } = useQuery<{
    ctaxRows: ICtaxRow[];
    ctaxRowsCount: number;
  }>(inSelect ? SELECT_CTAXS : GET_CTAXS, {
    onError: () => {
      // Do nothing
    },
    ...options,
    variables: {
      ...CTAX_ROW_DEFAULT_VARIABLES,
      ...options?.variables,
    },
  });

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
          ctaxRows: [...prev.ctaxRows, ...fetchMoreResult.ctaxRows],
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
