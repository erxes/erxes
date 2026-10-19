import {
  ApolloError,
  QueryHookOptions,
  NetworkStatus,
  useQuery,
  useSubscription,
} from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { TICKET_LIST_CHANGED } from '@/ticket/graphql/subscriptions/ticketListChanged';
import { GET_TICKET_LIST } from '@/report/graphql/queries/getTicketChart';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ReportTicketListQuery,
  ReportTicketListQueryVariables,
} from '~/gql/graphql';

type TicketListData = NonNullable<ReportTicketListQuery['reportTicketList']>;

export type TicketListItem = NonNullable<
  NonNullable<TicketListData['list']>[number]
>;

interface TicketListResult {
  list: TicketListItem[];
  totalCount: number;
  page: number;
  totalPages: number;
}

interface UseTicketListResult {
  ticketList?: TicketListResult;
  isFetching: boolean;
  isInitialLoad: boolean;
  isFetchingMore: boolean;
  hasNextPage: boolean;
  handleFetchMore: () => Promise<void>;
  fetchMoreError?: string;
  error?: ApolloError;
}

const toTicketList = (data: TicketListData): TicketListResult => ({
  list: data.list?.filter(isDefined) ?? [],
  totalCount: data.totalCount ?? 0,
  page: data.page ?? 1,
  totalPages: data.totalPages ?? 0,
});

export const useTicketList = (
  options: QueryHookOptions<
    ReportTicketListQuery,
    ReportTicketListQueryVariables
  > & {
    variables: ReportTicketListQueryVariables;
  },
): UseTicketListResult => {
  const { data, loading, networkStatus, error, refetch, fetchMore } = useQuery(
    GET_TICKET_LIST,
    {
      ...options,
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );
  const ticketList = useMemo(
    () =>
      data?.reportTicketList ? toTicketList(data.reportTicketList) : undefined,
    [data?.reportTicketList],
  );
  const isFetchingMore = networkStatus === NetworkStatus.fetchMore;
  const hasNextPage = Boolean(
    ticketList && ticketList.page < ticketList.totalPages,
  );
  const requestRef = useRef<object>();
  const [fetchMoreError, setFetchMoreError] = useState<string>();
  const variablesKey = JSON.stringify(options.variables);
  const resetPagination = useCallback(() => {
    requestRef.current = undefined;
    setFetchMoreError(undefined);
  }, []);

  useEffect(() => {
    resetPagination();
    return () => {
      requestRef.current = undefined;
    };
  }, [variablesKey, options.skip, resetPagination]);

  useSubscription(TICKET_LIST_CHANGED, {
    skip: options.skip,
    onData: () => {
      resetPagination();
      void refetch();
    },
  });

  const handleFetchMore = useCallback(async () => {
    if (
      options.skip ||
      loading ||
      requestRef.current ||
      !ticketList ||
      !hasNextPage
    )
      return;

    const request = {};
    requestRef.current = request;
    setFetchMoreError(undefined);
    try {
      await fetchMore({
        variables: {
          filters: { ...options.variables.filters, page: ticketList.page + 1 },
        },
        updateQuery: (previous, { fetchMoreResult }) => {
          const next = fetchMoreResult?.reportTicketList;
          if (requestRef.current !== request || !next) return previous;
          const previousList =
            previous.reportTicketList?.list?.filter(isDefined) ?? [];
          const ids = new Set(previousList.map(({ _id }) => _id));
          return {
            ...previous,
            reportTicketList: {
              ...next,
              list: [
                ...previousList,
                ...(next.list?.filter(isDefined) ?? []).filter(
                  ({ _id }) => !ids.has(_id),
                ),
              ],
            },
          };
        },
      });
    } catch (requestError) {
      if (requestRef.current === request) {
        setFetchMoreError(
          requestError instanceof Error
            ? requestError.message
            : String(requestError),
        );
      }
    } finally {
      if (requestRef.current === request) requestRef.current = undefined;
    }
  }, [
    options.skip,
    options.variables,
    loading,
    ticketList,
    hasNextPage,
    fetchMore,
  ]);

  return {
    ticketList,
    isFetching: loading && !isFetchingMore,
    isInitialLoad: loading && !data,
    isFetchingMore,
    hasNextPage,
    handleFetchMore,
    fetchMoreError,
    error,
  };
};
