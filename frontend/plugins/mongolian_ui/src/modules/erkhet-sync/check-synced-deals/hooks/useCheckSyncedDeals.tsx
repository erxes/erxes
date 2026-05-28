import { QueryHookOptions, useMutation, useQuery } from '@apollo/client';
import {
  EnumCursorDirection,
  IRecordTableCursorPageInfo,
  isUndefinedOrNull,
  mergeCursorData,
  parseDateRangeFromString,
  useMultiQueryState,
  useRecordTableCursor,
  useToast,
  validateFetchMore,
} from 'erxes-ui';
import { atom, useAtom, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import {
  checkSyncedMutation,
  syncDealsMutation,
} from '../../shared/graphql/mutations/checkSyncedMutations';
import { checkSyncedDealsQuery } from '../graphql/queries/checkSyncedDealsQuery';
import { checkSyncedDealsTotalCountAtom } from '../states/checkSyncedDealsCounts';
import { ICheckSyncedDeals } from '../types/checkSyncedDeals';
import { useCheckSyncedDealsLeadSessionKey } from './useCheckSyncedDealsLeadSessionKey';

export const CHECK_SYNCED_DEALS_PER_PAGE = 30;

type CheckSyncedResponse = {
  _id: string;
  isSynced?: boolean;
  syncedDate?: string;
  syncedBillNumber?: string;
  syncedCustomer?: string;
};

const checkedDealsAtom = atom<Record<string, Partial<ICheckSyncedDeals>>>({});

export const useCheckSyncedDealsVariables = (
  variables?: QueryHookOptions<{
    deals: {
      list: ICheckSyncedDeals[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>['variables'],
) => {
  const [
    {
      user,
      boardId,
      pipelineId,
      stageId,
      dealSearch,
      number,
      stageChangedDateRange,
      dateType,
      dateRange,
    },
  ] = useMultiQueryState<{
    user: string;
    boardId: string;
    pipelineId: string;
    stageId: string;
    dealSearch: string;
    number: string;
    stageChangedDateRange: string;
    dateType: string;
    dateRange: string;
  }>([
    'user',
    'boardId',
    'pipelineId',
    'stageId',
    'dealSearch',
    'number',
    'stageChangedDateRange',
    'dateType',
    'dateRange',
  ]);
  const { sessionKey } = useCheckSyncedDealsLeadSessionKey();

  const { cursor } = useRecordTableCursor({
    sessionKey,
  });

  return {
    limit: CHECK_SYNCED_DEALS_PER_PAGE,
    orderBy: {
      createdAt: -1,
    },
    cursor,
    number: number || undefined,
    search: dealSearch || undefined,
    startDate: parseDateRangeFromString(dateRange)?.from,
    endDate: parseDateRangeFromString(dateRange)?.to,
    dateType: dateType || undefined,
    type: 'checkSyncedDeals',

    userIds: user ? [user] : undefined,
    stageId: stageId || undefined,
    stageChangedStartDate: parseDateRangeFromString(stageChangedDateRange)
      ?.from,
    stageChangedEndDate: parseDateRangeFromString(stageChangedDateRange)?.to,
    ...variables,
  };
};
export const useCheckSyncedDeals = (options?: QueryHookOptions) => {
  const setCheckSyncedDealsTotalCount = useSetAtom(
    checkSyncedDealsTotalCountAtom,
  );
  const [checkedDeals, setCheckedDeals] = useAtom(checkedDealsAtom);
  const [toCheckSynced, { loading: checking }] = useMutation<{
    toCheckSynced: CheckSyncedResponse[];
  }>(checkSyncedMutation);
  const [toSyncDeals, { loading: syncing }] = useMutation<{
    toSyncDeals: {
      skipped?: string[];
      error?: string[];
      success?: string[];
    };
  }>(syncDealsMutation);
  const { toast } = useToast();
  const variables = useCheckSyncedDealsVariables(options?.variables);
  const { data, loading, fetchMore } = useQuery<{
    deals: {
      list: ICheckSyncedDeals[];
      totalCount: number;
      pageInfo: IRecordTableCursorPageInfo;
    };
  }>(checkSyncedDealsQuery, {
    ...options,
    variables: {
      skip: options?.skip || isUndefinedOrNull(variables.cursor),
      ...variables,
    },
  });

  const { list: rawDeals, totalCount, pageInfo } = data?.deals || {};
  const Deals = (rawDeals || []).map((deal) => ({
    ...deal,
    ...checkedDeals[deal._id],
  }));

  const checkDeals = async (ids: string[]) => {
    if (!ids.length) {
      toast({
        title: 'Warning',
        description: 'No deals to check',
        variant: 'destructive',
      });
      return;
    }

    const response = await toCheckSynced({
      variables: { ids, contentType: 'sales:deal' },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });

    if (!response.data) {
      return;
    }

    const checked = response.data?.toCheckSynced || [];
    const nextChecked = checked.reduce(
      (acc, item) => ({
        ...acc,
        [item._id]: {
          isSynced: item.isSynced,
          unSynced: item.isSynced ? '' : 'Yes',
          syncedDate: item.syncedDate,
          syncedBillNumber: item.syncedBillNumber,
          syncedCustomer: item.syncedCustomer,
        },
      }),
      {} as Record<string, Partial<ICheckSyncedDeals>>,
    );

    setCheckedDeals((current) => ({ ...current, ...nextChecked }));
    toast({
      title: 'Success',
      description: `${checked.length} deals checked`,
    });
  };

  const syncUncheckedDeals = async (ids: string[]) => {
    const uncheckedIds = ids.filter(
      (id) => checkedDeals[id]?.isSynced === false,
    );

    if (!uncheckedIds.length) {
      toast({
        title: 'Warning',
        description: 'No unchecked deals to sync',
        variant: 'destructive',
      });
      return;
    }

    const response = await toSyncDeals({
      variables: {
        dealIds: uncheckedIds,
        configStageId: variables.stageId,
        dateType: variables.dateType,
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });

    const result = response.data?.toSyncDeals;
    const successIds = result?.success || [];

    if (successIds.length) {
      await checkDeals(successIds);
    }

    toast({
      title: 'Sync complete',
      description: `${successIds.length} synced, ${
        result?.error?.length || 0
      } failed, ${result?.skipped?.length || 0} skipped`,
    });
  };

  useEffect(() => {
    if (!totalCount) return;
    setCheckSyncedDealsTotalCount(totalCount);
  }, [totalCount, setCheckSyncedDealsTotalCount]);

  const handleFetchMore = ({
    direction,
  }: {
    direction: EnumCursorDirection;
  }) => {
    if (
      !validateFetchMore({
        direction,
        pageInfo,
      })
    ) {
      return;
    }

    fetchMore({
      variables: {
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: CHECK_SYNCED_DEALS_PER_PAGE,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          deals: {
            ...mergeCursorData({
              direction,
              fetchMoreResult: fetchMoreResult.deals,
              prevResult: prev.deals,
            }),
            totalCount: fetchMoreResult.deals.totalCount,
          },
        };
      },
    });
  };

  return {
    loading,
    Deals,
    totalCount,
    checkDeals,
    syncUncheckedDeals,
    checking,
    syncing,
    handleFetchMore,
    pageInfo,
  };
};
