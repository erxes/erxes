import { toDealDetail } from '@/deals/utils/dealJson';
import { resolveDealDetail } from '@/deals/utils/resolveDealDetail';
import {
  QueryHookOptions,
  SubscribeToMoreOptions,
  useQuery,
} from '@apollo/client';
import type {
  DealDetailQuery,
  DealDetailQueryVariables,
  SalesDealChangedSubscription,
  SalesDealChangedSubscriptionVariables,
  SalesProductsDataChangedSubscription,
  SalesProductsDataChangedSubscriptionVariables,
} from '~/gql/graphql';

import { GET_DEAL_DETAIL } from '@/deals/graphql/queries/DealsQueries';
import { DEAL_CHANGED } from '@/deals/graphql/subscriptions/dealChanged';
import { PRODUCTS_DATA_CHANGED } from '@/deals/graphql/subscriptions/productsSubscriptions';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect, useMemo, useRef } from 'react';

export const useDealDetail = (
  options?: QueryHookOptions<DealDetailQuery, DealDetailQueryVariables>,
) => {
  const [activeDealId, setActiveDealId] = useAtom(dealDetailSheetState);
  const [salesItemId, setSalesItemId] = useQueryState<string>('salesItemId');

  const passedId = options?.variables?._id;
  const finalId = passedId || salesItemId || activeDealId;

  const { data, loading, error, subscribeToMore, refetch } = useQuery(
    GET_DEAL_DETAIL,
    {
      ...options,
      variables: finalId ? { _id: finalId } : undefined,
      skip: !finalId || options?.skip,
      fetchPolicy: options?.fetchPolicy || 'cache-and-network',
    },
  );

  useEffect(() => {
    if (!finalId || options?.skip) return;

    const subscriptionOptions: SubscribeToMoreOptions<
      DealDetailQuery,
      SalesProductsDataChangedSubscriptionVariables,
      SalesProductsDataChangedSubscription
    > = {
      document: PRODUCTS_DATA_CHANGED,
      variables: { _id: finalId },
      updateQuery: (prev, { subscriptionData }) => {
        const payload = subscriptionData?.data?.salesProductsDataChanged;
        if (!payload) return prev;

        refetch();

        return prev;
      },
    };

    return subscribeToMore(subscriptionOptions);
  }, [finalId, options?.skip, refetch, subscribeToMore]);

  useEffect(() => {
    if (!finalId || options?.skip) return;

    const subscriptionOptions: SubscribeToMoreOptions<
      DealDetailQuery,
      SalesDealChangedSubscriptionVariables,
      SalesDealChangedSubscription
    > = {
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
        if (!prevDeal) return prev;
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
                changedDeal.pipeline.paymentIds ??
                prevDeal.pipeline?.paymentIds ??
                null,
              paymentTypes:
                changedDeal.pipeline.paymentTypes ??
                prevDeal.pipeline?.paymentTypes,
            }
          : prevDeal.pipeline;

        const pipelineId =
          changedDeal.stage?.pipelineId ||
          changedDeal.pipelineId ||
          prevDeal.pipelineId ||
          prevDeal.stage?.pipelineId ||
          null;

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
    };

    return subscribeToMore(subscriptionOptions);
  }, [
    activeDealId,
    finalId,
    options?.skip,
    refetch,
    salesItemId,
    setActiveDealId,
    setSalesItemId,
    subscribeToMore,
  ]);

  const currentDeal = data?.dealDetail;
  const lastCompleteDealRef =
    useRef<NonNullable<DealDetailQuery['dealDetail']>>();

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

  const deal = useMemo(
    () => resolveDealDetail(currentDeal, lastCompleteDeal, finalId),
    [currentDeal, finalId, lastCompleteDeal],
  );

  const parsed = useMemo(() => {
    if (!deal) return { deal: undefined, error: undefined };
    try {
      return { deal: toDealDetail(deal), error: undefined };
    } catch (cause) {
      return {
        deal: undefined,
        error: cause instanceof Error ? cause : new Error('Invalid deal data'),
      };
    }
  }, [deal]);

  return {
    deal: parsed.deal,
    loading: loading && !deal,
    error: error || parsed.error,
    refetch,
  };
};
