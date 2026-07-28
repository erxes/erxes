import {
  EnumCursorDirection,
  ICursorListResponse,
  isUndefinedOrNull,
  mergeCursorData,
  toast,
  useQueryState,
  validateFetchMore,
} from 'erxes-ui';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { DEAL_LIST_CHANGED } from '@/deals/graphql/subscriptions/dealListChange';
import { GET_DEALS } from '@/deals/graphql/queries/DealsQueries';
import { IDeal } from '@/deals/types/deals';
import { currentUserState } from 'ui-modules';
import { dealTotalCountAtom } from '@/deals/states/dealsTotalCountState';
import { dealsViewAtom } from '@/deals/states/dealsViewState';

interface IDealChanged {
  salesDealListChanged: {
    action: string;
    deal: IDeal;
  };
}

const withResolvedFieldsOnly = (deal: IDeal) =>
  Object.entries(deal).reduce<Partial<IDeal>>(
    (fields, [key, value]) =>
      value === null ? fields : { ...fields, [key]: value },
    {},
  );

export const useDeals = (
  options?: QueryHookOptions<ICursorListResponse<IDeal>>,
  pipelineId?: string,
) => {
  const { t } = useTranslation('sales');
  const { data, loading, fetchMore, subscribeToMore } = useQuery<
    ICursorListResponse<IDeal>
  >(GET_DEALS, {
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
  const [qryStrPipelineId] = useQueryState('pipelineId');

  const lastPipelineId = pipelineId || qryStrPipelineId || '';

  const { list: deals, pageInfo, totalCount } = data?.deals || {};

  const filterVariables = options?.variables;
  const subscriptionKey = JSON.stringify({
    pipelineId: lastPipelineId,
    userId: currentUser?._id,
    filter: filterVariables ?? {},
  });
  const filterVariablesRef = useRef(filterVariables);
  filterVariablesRef.current = filterVariables;

  const dropsArchived =
    !filterVariables?.noSkipArchive && !filterVariables?.archivedOnly;

  useEffect(() => {
    if (!currentUser?._id || !lastPipelineId) return;

    const unsubscribe = subscribeToMore<IDealChanged>({
      document: DEAL_LIST_CHANGED,
      variables: {
        pipelineId: lastPipelineId,
        userId: currentUser._id,
        filter: filterVariablesRef.current,
      },

      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;
        if (!prev.deals?.list) return prev;

        const { action, deal } = subscriptionData.data.salesDealListChanged;
        const currentList = prev.deals.list;
        const changedDeal = withResolvedFieldsOnly(deal);

        const isArchived = deal?.status === 'archived';
        const resolvedAction =
          dropsArchived && isArchived && action !== 'remove'
            ? 'remove'
            : action;

        let updatedList = currentList;
        let added = false;
        let removed = false;

        if (resolvedAction === 'add') {
          const exists = currentList.some(
            (item: IDeal) => item._id === deal._id,
          );
          if (!exists) {
            const merged = [...currentList, deal];
            merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            updatedList = merged;
            added = true;
          }
        }

        if (resolvedAction === 'edit') {
          updatedList = currentList.map((item: IDeal) =>
            item._id === deal._id ? { ...item, ...changedDeal } : item,
          );
          updatedList.sort(
            (a: IDeal, b: IDeal) => (a.order ?? 0) - (b.order ?? 0),
          );
        }

        if (resolvedAction === 'remove') {
          removed = currentList.some((item: IDeal) => item._id === deal?._id);
          updatedList = currentList.filter(
            (item: IDeal) => item._id !== deal?._id,
          );
        }
        let nextTotalCount = prev.deals.totalCount;
        if (added) {
          nextTotalCount = prev.deals.totalCount + 1;
        } else if (removed) {
          nextTotalCount = prev.deals.totalCount - 1;
        }

        return {
          ...prev,
          deals: {
            ...prev.deals,
            list: updatedList,
            pageInfo: prev.deals.pageInfo,
            totalCount: nextTotalCount,
          },
        };
      },
    });

    return unsubscribe;
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
        if (!fetchMoreResult) return prev;
        const mergedDeals = mergeCursorData({
          direction,
          fetchMoreResult: fetchMoreResult.deals,
          prevResult: prev.deals,
        });
        return {
          ...prev,
          deals: {
            ...mergedDeals,
            totalCount: mergedDeals.totalCount ?? prev.deals.totalCount,
            pageInfo: {
              ...mergedDeals.pageInfo,
              startCursor: mergedDeals.pageInfo.startCursor ?? '',
              endCursor: mergedDeals.pageInfo.endCursor ?? '',
            },
          },
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
