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
import { useEffect, useMemo } from 'react';
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

  const subscriptionVars = useMemo(
    () => ({
      pipelineId: lastPipelineId,
      userId: currentUser?._id,
      filter: options?.variables,
    }),
    [lastPipelineId, currentUser?._id, options?.variables],
  );

  useEffect(() => {
    if (!currentUser?._id) return;

    const unsubscribe = subscribeToMore<IDealChanged>({
      document: DEAL_LIST_CHANGED,
      variables: subscriptionVars,

      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;
        if (!prev.deals?.list) return prev;

        const { action, deal } = subscriptionData.data.salesDealListChanged;
        const currentList = prev.deals.list;

        let updatedList = currentList;

        if (action === 'add') {
          const exists = currentList.some(
            (item: IDeal) => item._id === deal._id,
          );
          if (!exists) {
            const merged = [...currentList, deal];
            merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            updatedList = merged;
          }
        }

        if (action === 'edit') {
          updatedList = currentList.map((item: IDeal) =>
            item._id === deal._id ? { ...item, ...deal } : item,
          );
          updatedList.sort(
            (a: IDeal, b: IDeal) => (a.order ?? 0) - (b.order ?? 0),
          );
        }

        if (action === 'remove') {
          updatedList = currentList.filter(
            (item: IDeal) => item._id !== deal?._id,
          );
        }
        return {
          ...prev,
          deals: {
            ...prev.deals,
            list: updatedList,
            pageInfo: prev.deals.pageInfo,
            totalCount:
              action === 'add'
                ? prev.deals.totalCount + 1
                : action === 'remove'
                ? prev.deals.totalCount - 1
                : prev.deals.totalCount,
          },
        };
      },
    });

    return unsubscribe;
  }, [currentUser?._id, subscribeToMore, subscriptionVars]);

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
        return Object.assign({}, prev, {
          deals: mergeCursorData({
            direction,
            fetchMoreResult: fetchMoreResult.deals,
            prevResult: prev.deals,
          }),
        });
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
