import { useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  mergeCursorData,
  useRecordTableCursor,
  validateFetchMore,
} from 'erxes-ui';
import { useCallback } from 'react';
import { EXCHANGE_RATES_CURSOR_SESSION_KEY } from '../constants';
import { queries } from '../graphql';
import { MainQueryResponse } from '../types';

export const EXCHANGE_RATES_PER_PAGE = 30;

export const useExchangeRates = (searchValue?: string) => {
  const { cursor } = useRecordTableCursor({
    sessionKey: EXCHANGE_RATES_CURSOR_SESSION_KEY,
  });

  const { data, loading, fetchMore } = useQuery<MainQueryResponse>(
    queries.exchangeRatesMain,
    {
      variables: {
        limit: EXCHANGE_RATES_PER_PAGE,
        orderBy: { createdAt: -1 },
        cursor: cursor || undefined,
        searchValue: searchValue || undefined,
      },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );

  const rows = data?.exchangeRatesMain?.list || [];
  const totalCount = data?.exchangeRatesMain?.totalCount || 0;
  const pageInfo = data?.exchangeRatesMain?.pageInfo;

  const handleFetchMore = useCallback(
    ({ direction }: { direction: EnumCursorDirection }) => {
      if (!validateFetchMore({ direction, pageInfo })) return;

      fetchMore({
        variables: {
          cursor:
            direction === EnumCursorDirection.FORWARD
              ? pageInfo?.endCursor
              : pageInfo?.startCursor,
          limit: EXCHANGE_RATES_PER_PAGE,
          direction,
          searchValue: searchValue || undefined,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          return {
            ...prev,
            exchangeRatesMain: mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.exchangeRatesMain,
              prevResult: prev.exchangeRatesMain,
            }),
          };
        },
      });
    },
    [fetchMore, pageInfo, searchValue],
  );

  return {
    rows,
    totalCount,
    pageInfo,
    loading,
    handleFetchMore,
  };
};
