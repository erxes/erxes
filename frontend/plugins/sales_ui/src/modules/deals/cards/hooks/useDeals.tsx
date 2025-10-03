import {
  ADD_DEALS,
  DEALS_CHANGE,
  EDIT_DEALS,
  REMOVE_DEALS,
} from '@/deals/graphql/mutations/DealsMutations';
import {
  EnumCursorDirection,
  mergeCursorData,
  toast,
  useQueryState,
  validateFetchMore,
} from 'erxes-ui';
import {
  GET_DEALS,
  GET_DEAL_DETAIL,
} from '@/deals/graphql/queries/DealsQueries';
import { IDeal, IDealList } from '@/deals/types/deals';
import {
  MutationHookOptions,
  QueryHookOptions,
  useMutation,
  useQuery,
} from '@apollo/client';

import { UPDATE_STAGES_ORDER } from '@/deals/graphql/mutations/StagesMutations';
import { useEffect } from 'react';
import { DEAL_LIST_CHANGED } from '~/modules/deals/graphql/subscriptions/dealListChange';
import { currentUserState } from 'ui-modules';
import { useAtomValue } from 'jotai';

export const useDeals = (options?: QueryHookOptions<{ deals: IDealList }>, pipelineId?: string) => {
  const { data, loading, error, fetchMore, refetch, subscribeToMore } = useQuery<{
    deals: IDealList;
  }>(GET_DEALS, {
    ...options,
    variables: {
      ...options?.variables,
    },
  });

  const currentUser = useAtomValue(currentUserState);
  const { deals } = data || {};

  const { list = [], pageInfo, totalCount = 0 } = deals || {};

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  useEffect(() => {
    const unsubscribe = subscribeToMore<any>({
      document: DEAL_LIST_CHANGED,
      variables: { pipelineId: '2yxzj7yTiJBoWFGQC', userId: currentUser?._id, filter: options?.variables },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const { type, task } = subscriptionData.data.salesDealListChanged;
        const currentList = prev.deals.list;

        let updatedList = currentList;

        if (type === 'create') {
          const exists = currentList.some(
            (item: IDeal) => item._id === task._id,
          );
          if (!exists) {
            updatedList = [task, ...currentList];
          }
        }

        if (type === 'update') {
          updatedList = currentList.map((item: IDeal) =>
            item._id === task._id ? { ...item, ...task } : item,
          );
        }

        if (type === 'delete') {
          updatedList = currentList.filter(
            (item: IDeal) => item._id !== task._id,
          );
        }

        return {
          ...prev,
          deals: {
            ...prev.deals,
            list: updatedList,
            pageInfo: prev.deals.pageInfo,
            totalCount:
              type === 'create'
                ? prev.deals.totalCount + 1
                : type === 'delete'
                  ? prev.deals.totalCount - 1
                  : prev.deals.totalCount,
          },
        };
      },
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.variables]);

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
    deals: data?.deals,
    loading,
    error,
    handleFetchMore,
    pageInfo,
    hasPreviousPage,
    hasNextPage,
    refetch,
    totalCount,
    list,
  };
};

export const useDealDetail = (
  options?: QueryHookOptions<{ dealDetail: IDeal }>,
) => {
  const [_id] = useQueryState('salesItemId');

  const { data, loading, error } = useQuery<{ dealDetail: IDeal }>(
    GET_DEAL_DETAIL,
    {
      ...options,
      variables: {
        ...options?.variables,
        _id,
      },
      skip: !_id,
    },
  );

  return { deal: data?.dealDetail, loading, error };
};

export function useDealsEdit(options?: MutationHookOptions<any, any>) {
  const [_id] = useQueryState('salesItemId');

  const [editDeals, { loading, error }] = useMutation(EDIT_DEALS, {
    ...options,
    variables: {
      ...options?.variables,
      _id,
    },
    refetchQueries: [
      {
        query: GET_DEAL_DETAIL,
        variables: {
          ...options?.variables,
          _id,
        },
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: 'Successfully updated a deal',
        variant: 'default',
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Update failed',
        variant: 'destructive',
      });
    },
  });

  return {
    editDeals,
    loading,
    error,
  };
}

export function useDealsAdd(options?: MutationHookOptions<any, any>) {
  const [_id] = useQueryState('salesItemId');
  const [stageId] = useQueryState('stageId');

  const [addDeals, { loading, error }] = useMutation(ADD_DEALS, {
    ...options,
    variables: {
      ...options?.variables,
      _id,
      stageId,
    },
    refetchQueries: [
      {
        query: GET_DEALS,
        variables: {
          ...options?.variables,
        },
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: 'Successfully added a deal',
        variant: 'default',
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Update failed',
        variant: 'destructive',
      });
    },
  });

  return {
    addDeals,
    loading,
    error,
  };
}

export function useDealsRemove(options?: MutationHookOptions<any, any>) {
  const [_id] = useQueryState('salesItemId');

  const [removeDeals, { loading, error }] = useMutation(REMOVE_DEALS, {
    ...options,
    variables: {
      ...options?.variables,
      _id,
    },
    refetchQueries: [
      {
        query: GET_DEALS,
        variables: {
          ...options?.variables,
        },
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: 'Successfully removed a deal',
        variant: 'default',
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Update failed',
        variant: 'destructive',
      });
    },
  });

  return {
    removeDeals,
    loading,
    error,
  };
}

export function useDealsChange(options?: MutationHookOptions<any, any>) {
  const [changeDeals, { loading, error }] = useMutation(DEALS_CHANGE, {
    ...options,
    variables: {
      ...options?.variables,
    },
    refetchQueries: [
      {
        query: GET_DEALS,
        variables: {
          ...options?.variables,
        },
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: 'Successfully updated deal order',
        variant: 'default',
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Update failed',
        variant: 'destructive',
      });
    },
  });

  return {
    changeDeals,
    loading,
    error,
  };
}

export function useDealsStageChange(options?: MutationHookOptions<any, any>) {
  const [changeDealsStage, { loading, error }] = useMutation(
    UPDATE_STAGES_ORDER,
    {
      ...options,
      variables: {
        ...options?.variables,
      },
      refetchQueries: [
        {
          query: GET_DEALS,
          variables: {
            ...options?.variables,
          },
        },
      ],
      awaitRefetchQueries: true,
      onCompleted: (...args) => {
        toast({
          title: 'Successfully updated a deal',
          variant: 'default',
        });
        options?.onCompleted?.(...args);
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message || 'Update failed',
          variant: 'destructive',
        });
      },
    },
  );

  return {
    changeDealsStage,
    loading,
    error,
  };
}
