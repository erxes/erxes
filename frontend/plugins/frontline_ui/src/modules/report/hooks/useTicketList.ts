import {
  ApolloError,
  QueryHookOptions,
  NetworkStatus,
  useQuery,
  useSubscription,
} from '@apollo/client';
import { TICKET_LIST_CHANGED } from '@/ticket/graphql/subscriptions/ticketListChanged';
import { GET_TICKET_LIST } from '@/report/graphql/queries/getTicketChart';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { useTicketChartCard } from './useTicketChartCard';

interface TicketListVariables {
  filters: ReturnType<typeof useTicketChartCard>['queryFilters'] & {
    page: number;
    limit: number;
  };
}

export interface TicketListItem {
  _id: string;
  name: string;
  number?: string;
  statusId: string;
  status?: {
    _id: string;
    name: string;
    color?: string;
    type?: number;
  };
  state?: string;
  priority: number;
  assigneeId: string;
  createdAt: string;
  description?: string;
  updatedAt?: string;
  statusChangedDate?: string;
  statusChangedBy?: string;
  updatedBy?: string;
  targetDate?: string;
  startDate?: string;
  tagIds?: string[];
  pipelineId?: string;
  channelId?: string;
  branchId?: string;
  departmentId?: string;
  createdBy?: string;
  propertiesData?: Record<string, unknown>;
}

interface TicketListResult {
  list: TicketListItem[];
  totalCount: number;
  page: number;
  totalPages: number;
}

interface TicketListResponse {
  reportTicketList: TicketListResult;
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

export const useTicketList = (
  options: QueryHookOptions<TicketListResponse, TicketListVariables> & {
    variables: TicketListVariables;
  },
): UseTicketListResult => {
  const { data, loading, networkStatus, error, refetch, fetchMore } = useQuery<
    TicketListResponse,
    TicketListVariables
  >(GET_TICKET_LIST, {
    ...options,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });
  const ticketList = data?.reportTicketList;
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
          if (requestRef.current !== request || !fetchMoreResult)
            return previous;
          const ids = new Set(
            previous.reportTicketList.list.map(({ _id }) => _id),
          );
          return {
            ...previous,
            reportTicketList: {
              ...fetchMoreResult.reportTicketList,
              list: [
                ...previous.reportTicketList.list,
                ...fetchMoreResult.reportTicketList.list.filter(
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
