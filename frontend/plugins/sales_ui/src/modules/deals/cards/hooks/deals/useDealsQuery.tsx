import { mergeCursorList, toCursorPageInfo } from '@/deals/utils/cursorList';
import { toDealSubscriptionFilter } from '@/deals/utils/dealSubscriptionFilter';
import {
  QueryHookOptions,
  SubscribeToMoreOptions,
  useQuery,
} from '@apollo/client';
import {
  EnumCursorDirection,
  isDefined,
  isUndefinedOrNull,
  toast,
  useQueryState,
  validateFetchMore,
} from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  SalesDealListChangedSubscription,
  SalesDealListChangedSubscriptionVariables,
  SalesDealListQuery,
  SalesDealListQueryVariables,
} from '~/gql/graphql';

import { GET_DEALS } from '@/deals/graphql/queries/DealsQueries';
import { DEAL_LIST_CHANGED } from '@/deals/graphql/subscriptions/dealListChange';
import { dealTotalCountAtom } from '@/deals/states/dealsTotalCountState';
import { dealsViewAtom } from '@/deals/states/dealsViewState';
import { IDeal } from '@/deals/types/deals';
import { currentUserState } from 'ui-modules';

// Subscriptions skip computed resolvers, so these arrive null even when they have a
// value. Nulls on stored fields are real clears and are merged as-is.
const COMPUTED_DEAL_FIELDS = new Set([
  'amount',
  'pipeline',
  'boardId',
  'assignedUsers',
  'branches',
  'companies',
  'customers',
  'departments',
  'isWatched',
  'labels',
  'pipelineId',
  'products',
  'relations',
  'stage',
  'tags',
  'unUsedAmount',
]);

const withResolvedFieldsOnly = (deal: IDeal) =>
  Object.entries(deal).reduce<Partial<IDeal>>(
    (fields, [key, value]) =>
      value === null && COMPUTED_DEAL_FIELDS.has(key)
        ? fields
        : { ...fields, [key]: value },
    {},
  );

const sortByOrder = (deals: IDeal[]) =>
  [...deals].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

const applyDealChange = (
  currentList: IDeal[],
  action: string,
  deal: IDeal,
): { list: IDeal[]; countDelta: number } => {
  if (action === 'add') {
    const exists = currentList.some((item) => item._id === deal._id);

    return exists
      ? { list: currentList, countDelta: 0 }
      : { list: sortByOrder([...currentList, deal]), countDelta: 1 };
  }

  if (action === 'edit') {
    const changedDeal = withResolvedFieldsOnly(deal);

    return {
      list: sortByOrder(
        currentList.map((item) =>
          item._id === deal._id ? { ...item, ...changedDeal } : item,
        ),
      ),
      countDelta: 0,
    };
  }

  if (action === 'remove') {
    const list = currentList.filter((item) => item._id !== deal._id);

    return { list, countDelta: list.length - currentList.length };
  }

  return { list: currentList, countDelta: 0 };
};

export const useDeals = (
  options?: QueryHookOptions<SalesDealListQuery, SalesDealListQueryVariables>,
  pipelineId?: string,
) => {
  const { t } = useTranslation('sales');
  const { data, loading, fetchMore, subscribeToMore } = useQuery(GET_DEALS, {
    ...options,
    variables: { ...options?.variables },
    skip: options?.skip,
    fetchPolicy: 'cache-and-network',
    onError: (e) => {
      toast({
        title: t('error'),
        description: e.message,
        variant: 'destructive',
      });
    },
  });

  const currentUser = useAtomValue(currentUserState);
  const [qryStrPipelineId] = useQueryState<string>('pipelineId');

  const lastPipelineId = pipelineId || qryStrPipelineId || '';

  const deals = useMemo(
    () => data?.deals?.list?.filter(isDefined),
    [data?.deals?.list],
  );
  const pageInfo = useMemo(
    () => toCursorPageInfo(data?.deals?.pageInfo),
    [data?.deals?.pageInfo],
  );
  const totalCount = data?.deals?.totalCount ?? undefined;

  const filterVariables = options?.variables;
  const subscriptionKey = JSON.stringify({
    pipelineId: lastPipelineId,
    userId: currentUser?._id,
    filter: filterVariables ?? {},
  });
  const filterVariablesRef = useRef(filterVariables);
  filterVariablesRef.current = filterVariables;

  const dropsArchived =
    !filterVariables?.noSkipArchive && filterVariables?.status !== 'archived';

  useEffect(() => {
    if (!currentUser?._id || !lastPipelineId) return;

    const subscriptionOptions: SubscribeToMoreOptions<
      SalesDealListQuery,
      SalesDealListChangedSubscriptionVariables,
      SalesDealListChangedSubscription,
      SalesDealListQueryVariables
    > = {
      document: DEAL_LIST_CHANGED,
      variables: {
        pipelineId: lastPipelineId,
        userId: currentUser._id,
        filter: toDealSubscriptionFilter(filterVariablesRef.current),
      },

      updateQuery: (prev, { subscriptionData }) => {
        if (!prev?.deals?.list || !subscriptionData.data) return prev;

        const payload = subscriptionData.data.salesDealListChanged;
        if (!payload?.action) return prev;
        const { action, deal } = payload;

        if (!deal) return prev;

        const isArchived = deal.status === 'archived';
        const resolvedAction =
          dropsArchived && isArchived && action !== 'remove'
            ? 'remove'
            : action;

        const { list, countDelta } = applyDealChange(
          prev.deals.list.filter(isDefined),
          resolvedAction,
          deal,
        );

        if (list === prev.deals.list) return prev;

        return {
          ...prev,
          deals: {
            ...prev.deals,
            list,
            pageInfo: prev.deals.pageInfo,
            totalCount: (prev.deals.totalCount ?? 0) + countDelta,
          },
        };
      },
    };

    return subscribeToMore(subscriptionOptions);
  }, [
    currentUser?._id,
    dropsArchived,
    lastPipelineId,
    subscribeToMore,
    subscriptionKey,
  ]);

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
        ...options?.variables,
        cursor:
          direction === EnumCursorDirection.FORWARD
            ? pageInfo?.endCursor
            : pageInfo?.startCursor,
        limit: 20,
        direction,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult.deals) return prev;
        return {
          ...prev,
          deals: prev.deals
            ? mergeCursorList(direction, prev.deals, fetchMoreResult.deals)
            : fetchMoreResult.deals,
        };
      },
    });
  };

  const view = useAtomValue(dealsViewAtom);
  const setTotalCount = useSetAtom(dealTotalCountAtom);

  useEffect(() => {
    if (view === 'list') {
      if (loading) {
        setTotalCount(null);
      } else {
        const finalCount = isUndefinedOrNull(totalCount)
          ? deals?.length || 0
          : totalCount;
        setTotalCount(finalCount);
      }
    }
  }, [view, totalCount, loading, deals?.length, setTotalCount]);

  useEffect(() => {
    return () => {
      if (view === 'list') {
        setTotalCount(null);
      }
    };
  }, [view, setTotalCount]);

  return {
    loading,
    deals,
    handleFetchMore,
    pageInfo,
    totalCount,
  };
};
