import { useQuery } from '@apollo/client';
import { queries } from '../graphql';
import { MainQueryResponse } from '../types';

export const EXCHANGE_RATES_PER_PAGE = 30;

export const useExchangeRates = (searchValue?: string) => {
  const { data, loading, fetchMore } = useQuery<MainQueryResponse>(
    queries.exchangeRatesMain,
    {
      variables: {
        page: 1,
        perPage: EXCHANGE_RATES_PER_PAGE,
        searchValue: searchValue || undefined,
      },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );

  const rows = data?.exchangeRatesMain?.list || [];
  const totalCount = data?.exchangeRatesMain?.totalCount || 0;
  const hasMore = rows.length < totalCount;

  const handleLoadMore = () => {
    if (!hasMore) return;

    fetchMore({
      variables: {
        page: Math.floor(rows.length / EXCHANGE_RATES_PER_PAGE) + 1,
        perPage: EXCHANGE_RATES_PER_PAGE,
        searchValue: searchValue || undefined,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          exchangeRatesMain: {
            ...fetchMoreResult.exchangeRatesMain,
            list: [
              ...(prev.exchangeRatesMain?.list || []),
              ...(fetchMoreResult.exchangeRatesMain?.list || []),
            ],
          },
        };
      },
    });
  };

  return { rows, totalCount, loading, hasMore, handleLoadMore };
};
