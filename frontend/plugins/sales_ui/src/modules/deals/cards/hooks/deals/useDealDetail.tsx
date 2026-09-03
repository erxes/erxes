import { QueryHookOptions, useQuery } from '@apollo/client';

import { DEAL_CHANGED } from '@/deals/graphql/subscriptions/dealChanged';
import { GET_DEAL_DETAIL } from '@/deals/graphql/queries/DealsQueries';
import { IDeal } from '@/deals/types/deals';
import { PRODUCTS_DATA_CHANGED } from '@/deals/graphql/subscriptions/productsSubscriptions';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import { useQueryState } from 'erxes-ui';

interface ISalesProductsDataChangedPayload {
  salesProductsDataChanged: {
    _id: string;
    processId: string;
    action: string;
    data: unknown;
  };
}

interface ISalesDealChangedPayload {
  salesDealChanged: {
    action: string;
    deal?: IDeal;
  };
}

export const useDealDetail = (
  options?: QueryHookOptions<{ dealDetail: IDeal }>,
) => {
  const [activeDealId, setActiveDealId] = useAtom(dealDetailSheetState);
  const [salesItemId, setSalesItemId] = useQueryState('salesItemId');

  const passedId = options?.variables?._id;
  const finalId = passedId || salesItemId || activeDealId;

  const { data, loading, error, subscribeToMore, refetch } = useQuery<{
    dealDetail: IDeal;
  }>(GET_DEAL_DETAIL, {
    ...options,
    variables: {
      ...options?.variables,
      _id: finalId,
    },
    skip: !finalId,
    fetchPolicy: options?.fetchPolicy || 'cache-and-network',
  });

  useEffect(() => {
    if (!finalId) return;

    const unsubscribe = subscribeToMore<ISalesProductsDataChangedPayload>({
      document: PRODUCTS_DATA_CHANGED,
      variables: { _id: finalId },
      updateQuery: (prev, { subscriptionData }) => {
        const payload = subscriptionData?.data?.salesProductsDataChanged;
        if (!payload) return prev;

        refetch();

        return prev;
      },
    });

    return unsubscribe;
  }, [finalId, refetch, subscribeToMore]);

  useEffect(() => {
    if (!finalId) return;

    const unsubscribe = subscribeToMore<ISalesDealChangedPayload>({
      document: DEAL_CHANGED,
      variables: { _id: finalId },
      updateQuery: (prev, { subscriptionData }) => {
        const dealChange = subscriptionData?.data?.salesDealChanged;

        if (dealChange?.action === 'delete') {
          if (activeDealId === finalId) {
            setActiveDealId(null);
          }

          if (salesItemId === finalId) {
            setSalesItemId(null);
          }

          return prev;
        }

        const changedDeal = dealChange?.deal;

        if (!changedDeal) {
          return prev;
        }

        const prevDeal = prev.dealDetail;
        const isStageChanged =
          changedDeal.stageId && changedDeal.stageId !== prevDeal?.stageId;

        if (isStageChanged) {
          refetch();
        }

        const pipeline = changedDeal.pipeline
          ? {
              ...prevDeal.pipeline,
              ...changedDeal.pipeline,
              paymentIds:
                changedDeal.pipeline.paymentIds ?? prevDeal.pipeline.paymentIds,
              paymentTypes:
                changedDeal.pipeline.paymentTypes ??
                prevDeal.pipeline.paymentTypes,
            }
          : prevDeal.pipeline;

        const pipelineId =
          changedDeal.stage?.pipelineId ||
          changedDeal.pipelineId ||
          prevDeal.pipelineId ||
          prevDeal.stage?.pipelineId;

        return {
          ...prev,
          dealDetail: {
            ...prevDeal,
            ...changedDeal,
            customers: changedDeal.customers ?? prevDeal.customers,
            isWatched: changedDeal.isWatched ?? prevDeal.isWatched,
            pipeline,
            pipelineId,
            stage: changedDeal.stage || prevDeal.stage,
          },
        };
      },
    });

    return unsubscribe;
  }, [
    activeDealId,
    finalId,
    refetch,
    salesItemId,
    setActiveDealId,
    setSalesItemId,
    subscribeToMore,
  ]);

  const currentDeal = data?.dealDetail;
  const lastCompleteDealRef = useRef<IDeal>();

  useEffect(() => {
    if (!finalId) {
      lastCompleteDealRef.current = undefined;
      return;
    }

    if (currentDeal?._id === finalId && currentDeal?.pipeline) {
      lastCompleteDealRef.current = currentDeal;
      return;
    }

    if (lastCompleteDealRef.current?._id !== finalId) {
      lastCompleteDealRef.current = undefined;
    }
  }, [currentDeal, finalId]);

  const lastCompleteDeal =
    lastCompleteDealRef.current?._id === finalId
      ? lastCompleteDealRef.current
      : undefined;

  const deal =
    currentDeal?.pipeline && currentDeal._id === finalId
      ? currentDeal
      : lastCompleteDeal;

  return { deal, loading: loading && !deal, error, refetch };
};
