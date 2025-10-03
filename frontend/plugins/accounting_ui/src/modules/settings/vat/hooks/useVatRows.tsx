import { OperationVariables, useQuery } from '@apollo/client';
import { GET_VATS, SELECT_VATS } from '../graphql/queries/getVats';
import {
  VAT_ROW_DEFAULT_VARIABLES,
  VAT_ROW_PER_PAGE,
} from '../constants/vatRowDefaultVariables';
import { IVatRow } from '../types/VatRow';

export const useVatRows = (
  options?: OperationVariables,
  inSelect?: boolean,
) => {
  const { data, loading, fetchMore, error } = useQuery<{
    vatRows: IVatRow[];
    vatRowsCount: number;
  }>(inSelect ? SELECT_VATS : GET_VATS, {
    onError: () => {
      // Do nothing
    },
    ...options,
    variables: {
      ...VAT_ROW_DEFAULT_VARIABLES,
      ...options?.variables,
    },
  });

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
          vatRows: [...prev.vatRows, ...fetchMoreResult.vatRows],
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
