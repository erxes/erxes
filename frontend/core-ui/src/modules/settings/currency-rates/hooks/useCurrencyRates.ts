import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  useQueryState,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useCallback } from 'react';
import {
  CURRENCY_RATE_FILTER_QUERY_KEY,
  CURRENCY_RATES_CURSOR_SESSION_KEY,
  CURRENCY_RATES_PER_PAGE,
} from '../constants';
import { CURRENCY_RATES } from '../graphql';
import { ICurrencyRatesQueryResponse } from '../types';

export const useCurrencyRates = () => {
  const [rateCurrency] = useQueryState<string>(CURRENCY_RATE_FILTER_QUERY_KEY);
  const { cursor } = useRecordTableCursor({
    sessionKey: CURRENCY_RATES_CURSOR_SESSION_KEY,
  });

  const { data, loading, error, fetchMore } =
    useQuery<ICurrencyRatesQueryResponse>(CURRENCY_RATES, {
      variables: {
        limit: CURRENCY_RATES_PER_PAGE,
        cursor: cursor || undefined,
        rateCurrency: rateCurrency || undefined,
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    });

  const rates = data?.currencyRates?.list || [];
  const totalCount = data?.currencyRates?.totalCount || 0;
  const pageInfo = data?.currencyRates?.pageInfo;

  const handleFetchMore = useCallback(
    ({ direction }: { direction: EnumCursorDirection }) => {
      if (!validateFetchMore({ direction, pageInfo })) return;

      fetchMore({
        variables: {
          cursor:
            direction === EnumCursorDirection.FORWARD
              ? pageInfo?.endCursor
              : pageInfo?.startCursor,
          limit: CURRENCY_RATES_PER_PAGE,
          direction,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          return {
            ...prev,
            currencyRates: {
              ...mergeCursorData({
                direction,
                fetchMoreResult: fetchMoreResult.currencyRates,
                prevResult: prev.currencyRates,
              }),
              totalCount: fetchMoreResult.currencyRates.totalCount,
            },
          };
        },
      });
    },
    [fetchMore, pageInfo],
  );

  return {
    rates,
    totalCount,
    pageInfo,
    loading,
    error,
    isFiltered: Boolean(rateCurrency),
    handleFetchMore,
  };
};
