import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  toast,
  useQueryState,
  validateFetchMore,
} from 'erxes-ui';
import { GET_DEALS } from '../graphql/queries/dealsQueries';
import { QueryHookOptions, useQuery } from '@apollo/client';
import { useAtomValue } from 'jotai';
import { useEffect, useMemo } from 'react';

import { DEAL_LIST_CHANGED } from '../graphql/subscriptions/dealListChange';
import { IDeal } from '../types/deals';
import { currentUserState } from 'ui-modules/states';

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
  const { data, loading, fetchMore, subscribeToMore } = useQuery<
    ICursorListResponse<IDeal>
  >(GET_DEALS, {
    ...options,
    variables: { ...options?.variables },
    skip: options?.skip,
    fetchPolicy: 'cache-and-network',
    onError: (e) => {
      toast({
        title: 'Error',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lastPipelineId, currentUser?._id, JSON.stringify(options?.variables)],
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
            updatedList = [deal, ...currentList];
          }
        }

        if (action === 'edit') {
          updatedList = currentList.map((item: IDeal) =>
            item._id === deal._id ? { ...item, ...deal } : item,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribeToMore, subscriptionVars]);

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

  return {
    loading,
    deals,
    handleFetchMore,
    pageInfo,
    totalCount,
  };
};
