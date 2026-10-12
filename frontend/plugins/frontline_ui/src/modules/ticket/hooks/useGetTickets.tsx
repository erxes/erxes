import { GET_TICKETS } from '@/ticket/graphql/queries/getTickets';
import { TICKET_LIST_CHANGED } from '@/ticket/graphql/subscriptions/ticketListChanged';
import { ticketSortAtom } from '@/ticket/states/ticketSortState';
import {
  compactList,
  mergeCursorList,
  toCursorPageInfo,
} from '@/shared/utils/cursorList';
import { QueryHookOptions, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  isUndefinedOrNull,
  parseDateRangeFromString,
  useNonNullMultiQueryState,
  useToast,
  validateFetchMore,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  GetTicketsQuery,
  GetTicketsQueryVariables,
  ITicketFilter,
} from '~/gql/graphql';

const TICKETS_PER_PAGE = 30;

export const TICKET_SORT_FIELDS = [
  { label: 'Updated', value: 'updatedAt' },
  { label: 'Created', value: 'createdAt' },
] as const;

export type TicketSortField = (typeof TICKET_SORT_FIELDS)[number]['value'];

export const useTicketsVariables = (
  variables?: ITicketFilter,
): ITicketFilter => {
  const {
    searchValue,
    assignee,
    priority,
    statusId,
    state,
    channelId,
    pipelineId,
    segments,
    createdStartDate,
    startDateStartDate,
    targetDateStartDate,
    statusChangedStartDate,
    branchIds,
    departmentIds,
    propertiesData,
  } = useNonNullMultiQueryState<{
    searchValue: string;
    assignee: string;
    priority: number;
    statusId: string;
    state: string;
    channelId: string;
    pipelineId: string;
    segments: string[];
    createdStartDate: string;
    startDateStartDate: string;
    targetDateStartDate: string;
    statusChangedStartDate: string;
    branchIds: string[];
    departmentIds: string[];
    propertiesData: string;
  }>([
    'searchValue',
    'assignee',
    'priority',
    'statusId',
    'state',
    'channelId',
    'pipelineId',
    'segments',
    'createdStartDate',
    'startDateStartDate',
    'targetDateStartDate',
    'statusChangedStartDate',
    'branchIds',
    'departmentIds',
    'propertiesData',
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
    channelId: channelId,
    pipelineId: pipelineId,
    state: state,
    segmentIds: segments || undefined,
    createdStartDate: parseDateRangeFromString(createdStartDate)?.from,
    createdEndDate: parseDateRangeFromString(createdStartDate)?.to,
    startDateStartDate: parseDateRangeFromString(startDateStartDate)?.from,
    startDateEndDate: parseDateRangeFromString(startDateStartDate)?.to,
    targetDateStartDate: parseDateRangeFromString(targetDateStartDate)?.from,
    targetDateEndDate: parseDateRangeFromString(targetDateStartDate)?.to,
    statusChangedStartDate: parseDateRangeFromString(statusChangedStartDate)
      ?.from,
    statusChangedEndDate: parseDateRangeFromString(statusChangedStartDate)?.to,
    branchIds: branchIds || undefined,
    departmentIds: departmentIds || undefined,
    propertiesData: propertiesData || undefined,
    ...variables,
  };
};

export const useTickets = (
  options?: QueryHookOptions<GetTicketsQuery, GetTicketsQueryVariables> & {
    variables?: ITicketFilter;
  },
) => {
  const { t } = useTranslation('frontline');
  const variables = useTicketsVariables(options?.variables);
  const { toast } = useToast();
  const { data, loading, fetchMore, subscribeToMore } = useQuery(GET_TICKETS, {
    ...options,
    variables: { filter: variables },
    skip: options?.skip || isUndefinedOrNull(variables.cursor),
    fetchPolicy: 'cache-and-network',
    onError: (e) => {
      toast({
        title: t('error', 'Error'),
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const tickets = useMemo(
    () =>
      data?.getTickets?.list ? compactList(data.getTickets.list) : undefined,
    [data?.getTickets?.list],
  );
  const pageInfo = useMemo(
    () => toCursorPageInfo(data?.getTickets?.pageInfo),
    [data?.getTickets?.pageInfo],
  );
  const totalCount = data?.getTickets?.totalCount ?? undefined;

  useEffect(() => {
    const unsubscribe = subscribeToMore({
      document: TICKET_LIST_CHANGED,
      variables: { filter: variables },
      updateQuery: (prev, { subscriptionData }) => {
        const changed = subscriptionData.data?.ticketListChanged;

        if (!changed) return prev;

        const { type, ticket } = changed;

        const currentList = prev?.getTickets?.list
          ? compactList(prev.getTickets.list)
          : undefined;

        if (!ticket || !currentList || !prev.getTickets) return prev;

        const isRemoval = type === 'delete' || type === 'remove';

        let updatedList = currentList;
        let countDelta = 0;

        const listState = variables.state || 'active';
        const ticketState = ticket.state || 'active';
        const matchesFilter =
          ticketState === listState &&
          (!variables.statusId || ticket.statusId === variables.statusId);

        if (type === 'create') {
          const exists = currentList.some((item) => item._id === ticket._id);
          if (!exists && matchesFilter) {
            updatedList = [ticket, ...currentList];
            countDelta = 1;
          }
        }

        if (type === 'update') {
          const wasPresent = currentList.some(
            (item) => item._id === ticket._id,
          );

          if (!matchesFilter) {
            updatedList = currentList.filter((item) => item._id !== ticket._id);
            if (wasPresent) {
              countDelta = -1;
            }
          } else if (wasPresent) {
            updatedList = currentList.map((item) =>
              item._id === ticket._id ? { ...item, ...ticket } : item,
            );
          } else if (matchesFilter) {
            updatedList = [ticket, ...currentList];
            countDelta = 1;
          }
        }

        if (isRemoval) {
          updatedList = currentList.filter((item) => item._id !== ticket._id);
          countDelta = -1;
        }

        return {
          ...prev,
          getTickets: {
            ...prev.getTickets,
            list: updatedList,
            pageInfo: prev.getTickets.pageInfo,
            totalCount: (prev.getTickets.totalCount ?? 0) + countDelta,
          },
        };
      },
    });

    return unsubscribe;
  }, [variables, subscribeToMore]);

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
        if (!fetchMoreResult.getTickets || !prev.getTickets) return prev;

        return {
          ...prev,
          getTickets: mergeCursorList(
            direction,
            prev.getTickets,
            fetchMoreResult.getTickets,
          ),
        };
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
