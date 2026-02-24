import { GET_TICKETS } from '@/ticket/graphql/queries/getTickets';
import { TICKET_LIST_CHANGED } from '@/ticket/graphql/subscriptions/ticketListChanged';
import { ITicket } from '@/ticket/types';
import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  ICursorListResponse,
  isUndefinedOrNull,
  mergeCursorData,
  useNonNullMultiQueryState,
  useToast,
  validateFetchMore,
} from 'erxes-ui';
import { useEffect } from 'react';

const TICKETS_PER_PAGE = 30;

interface ITicketChanged {
  ticketListChanged: {
    type: string;
    ticket: ITicket;
  };
}

export const useTicketsVariables = (
  variables?: QueryHookOptions<ICursorListResponse<ITicket>>['variables'],
) => {
  const { searchValue, assignee, priority, statusId } =
    useNonNullMultiQueryState<{
      searchValue: string;
      assignee: string;
      priority: string;
      statusId: string;
    }>(['searchValue', 'assignee', 'priority', 'statusId']);

  return {
    cursor: '',
    limit: TICKETS_PER_PAGE,
    orderBy: {
      updatedAt: -1,
    },
    direction: 'forward',
    name: searchValue,
    assigneeId: assignee,
    priority: priority,
    statusId: statusId,
    ...variables,
  };
};

export const useTickets = (
  options?: QueryHookOptions<ICursorListResponse<ITicket>>,
) => {
  const variables = useTicketsVariables(options?.variables);
  const { toast } = useToast();
  const { data, loading, fetchMore, subscribeToMore } = useQuery<
    ICursorListResponse<ITicket>
  >(GET_TICKETS, {
    ...options,
    variables: { filter: variables },
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    fetchPolicy: 'cache-and-network',
    onError: (e) => {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const { list: tickets, pageInfo, totalCount } = data?.getTickets || {};

  useEffect(() => {
    const unsubscribe = subscribeToMore<ITicketChanged>({
      document: TICKET_LIST_CHANGED,
      variables: { filter: variables },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const { type, ticket } = subscriptionData.data.ticketListChanged;
        const currentList = prev.getTickets.list;

        let updatedList = currentList;

        if (type === 'create') {
          const exists = currentList.some(
            (item: ITicket) => item._id === ticket._id,
          );
          if (!exists) {
            updatedList = [ticket, ...currentList];
          }
        }

        if (type === 'update') {
          updatedList = currentList.map((item: ITicket) =>
            item._id === ticket._id ? { ...item, ...ticket } : item,
          );
        }

        if (type === 'remove') {
          updatedList = currentList.filter(
            (item: ITicket) => item._id !== ticket._id,
          );
        }

        return {
          ...prev,
          getTickets: {
            ...prev.getTickets,
            list: updatedList,
            pageInfo: prev.getTickets.pageInfo,
            totalCount:
              type === 'create'
                ? prev.getTickets.totalCount + 1
                : type === 'remove'
                  ? prev.getTickets.totalCount - 1
                  : prev.getTickets.totalCount,
          },
        };
      },
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variables]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (!validateFetchMore({ direction, pageInfo })) {
      return;
    }

    fetchMore({
      variables: {
        filter: {
          ...variables,
          cursor:
            direction === EnumCursorDirection.FORWARD
              ? pageInfo?.endCursor
              : pageInfo?.startCursor,
          limit: TICKETS_PER_PAGE,
          direction:
            direction === EnumCursorDirection.FORWARD ? 'forward' : 'backward',
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;

        return Object.assign({}, prev, {
          getTickets: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.getTickets,
            prevResult: prev.getTickets,
          }),
        });
      },
    });
  };

  return {
    loading,
    tickets,
    handleFetchMore,
    pageInfo,
    totalCount,
  };
};
