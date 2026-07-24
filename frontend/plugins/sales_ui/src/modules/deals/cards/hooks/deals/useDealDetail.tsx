import { QueryHookOptions, useQuery } from '@apollo/client';

import { DEAL_CHANGED } from '@/deals/graphql/subscriptions/dealChanged';
import { GET_DEAL_DETAIL } from '@/deals/graphql/queries/DealsQueries';
import { IDeal } from '@/deals/types/deals';
import { PRODUCTS_DATA_CHANGED } from '@/deals/graphql/subscriptions/productsSubscriptions';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
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
  const [activeDealId] = useAtom(dealDetailSheetState);
  const [salesItemId] = useQueryState('salesItemId');

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
    if (!salesItemId) return;

    const unsubscribe = subscribeToMore<ISalesProductsDataChangedPayload>({
      document: PRODUCTS_DATA_CHANGED,
      variables: { _id: salesItemId },
      updateQuery: (prev, { subscriptionData }) => {
        const payload = subscriptionData?.data?.salesProductsDataChanged;
        if (!payload) return prev;

        const { processId } = payload;

        if (processId === localStorage.getItem('processId')) {
          return prev;
        }

        refetch();

        return prev;
      },
    });

    return unsubscribe;
  }, [refetch, salesItemId, subscribeToMore]);

  useEffect(() => {
    if (!finalId) return;

    const unsubscribe = subscribeToMore<ISalesDealChangedPayload>({
      document: DEAL_CHANGED,
      variables: { _id: finalId },
      updateQuery: (prev, { subscriptionData }) => {
        const changedDeal = subscriptionData?.data?.salesDealChanged?.deal;

        if (!changedDeal) {
          return prev;
        }

        const prevDeal = prev.dealDetail;
        const isStageChanged =
          changedDeal.stageId && changedDeal.stageId !== prevDeal?.stageId;

        if (isStageChanged) {
          refetch();
        }

        const pipelineId =
          changedDeal.stage?.pipelineId ||
          changedDeal.pipelineId ||
          prevDeal?.pipelineId ||
          prevDeal?.stage?.pipelineId;

        return {
          ...prev,
          dealDetail: {
            ...prevDeal,
            ...changedDeal,
            pipeline: changedDeal.pipeline || prevDeal?.pipeline,
            pipelineId,
            stage: changedDeal.stage || prevDeal?.stage,
          },
        };
      },
    });

    return unsubscribe;
  }, [finalId, refetch, subscribeToMore]);

  const deal = data?.dealDetail;

  return { deal, loading: loading && !deal, error, refetch };
};
