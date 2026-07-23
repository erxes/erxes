import { GET_TICKETS } from '@/ticket/graphql/queries/getTickets';
import { TICKET_LIST_CHANGED } from '@/ticket/graphql/subscriptions/ticketListChanged';
import { ticketSortAtom } from '@/ticket/states/ticketSortState';
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
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const TICKETS_PER_PAGE = 30;

interface ITicketChanged {
  ticketListChanged: {
    type: string;
    ticket: ITicket;
  };
}

export const TICKET_SORT_FIELDS = [
  { label: 'Updated', value: 'updatedAt' },
  { label: 'Created', value: 'createdAt' },
] as const;

export type TicketSortField = (typeof TICKET_SORT_FIELDS)[number]['value'];

export const useTicketsVariables = (
  variables?: QueryHookOptions<ICursorListResponse<ITicket>>['variables'],
) => {
  const { searchValue, assignee, priority, statusId, state, pipelineId } =
    useNonNullMultiQueryState<{
      searchValue: string;
      assignee: string;
      priority: string;
      statusId: string;
      state: string;
      pipelineId: string;
    }>([
      'searchValue',
      'assignee',
      'priority',
      'statusId',
      'state',
      'pipelineId',
    ]);

  const sortField = useAtomValue(ticketSortAtom);

  return {
    cursor: '',
    limit: TICKETS_PER_PAGE,
    orderBy: {
      [sortField]: -1,
    },
    direction: 'forward',

    searchValue: searchValue,
    assigneeId: assignee,
    priority: priority,
    statusId: statusId,
    pipelineId: pipelineId,
    state: state,
    ...variables,
  };
};

export const useTickets = (
  options?: QueryHookOptions<ICursorListResponse<ITicket>>,
) => {
  const { t } = useTranslation('frontline');
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
        title: t('error'),
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
        if (!prev || !subscriptionData.data || !prev.getTickets) return prev;

        const { type, ticket } = subscriptionData.data.ticketListChanged;
        const currentList = prev.getTickets.list;

        if (!ticket) return prev;

        const isRemoval = type === 'delete' || type === 'remove';

        let updatedList = currentList;
        let countDelta = 0;

        const listState = variables.state || 'active';
        const ticketState = ticket.state || 'active';
        const matchesFilter =
          ticketState === listState &&
          (!variables.statusId || ticket.statusId === variables.statusId);

        if (type === 'create') {
          const exists = currentList.some(
            (item: ITicket) => item._id === ticket._id,
          );
          if (!exists && matchesFilter) {
            updatedList = [ticket, ...currentList];
            countDelta = 1;
          }
        }

        if (type === 'update') {
          const wasPresent = currentList.some(
            (item: ITicket) => item._id === ticket._id,
          );

          if (!matchesFilter) {
            updatedList = currentList.filter(
              (item: ITicket) => item._id !== ticket._id,
            );
            if (wasPresent) {
              countDelta = -1;
            }
          } else if (wasPresent) {
            updatedList = currentList.map((item: ITicket) =>
              item._id === ticket._id ? { ...item, ...ticket } : item,
            );
          } else if (matchesFilter) {
            updatedList = [ticket, ...currentList];
            countDelta = 1;
          }
        }

        if (isRemoval) {
          updatedList = currentList.filter(
            (item: ITicket) => item._id !== ticket._id,
          );
          countDelta = -1;
        }

        return {
          ...prev,
          getTickets: {
            ...prev.getTickets,
            list: updatedList,
            pageInfo: prev.getTickets.pageInfo,
            totalCount: prev.getTickets.totalCount + countDelta,
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
