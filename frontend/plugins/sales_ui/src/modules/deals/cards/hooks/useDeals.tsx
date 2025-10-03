import {
  ADD_DEALS,
  DEALS_ARCHIVE,
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

import { DEAL_LIST_CHANGED } from '~/modules/deals/graphql/subscriptions/dealListChange';
import { currentUserState } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';

export const useDeals = (
  options?: QueryHookOptions<{ deals: IDealList }>,
  pipelineId?: string,
) => {
  const { data, loading, error, fetchMore, refetch, subscribeToMore } =
    useQuery<{
      deals: IDealList;
    }>(GET_DEALS, {
      ...options,
      variables: {
        ...options?.variables,
      },
    });

  const [qryStrPipelineId] = useQueryState('pipelineId');

  const lastPipelineId = pipelineId || qryStrPipelineId || '';

  const currentUser = useAtomValue(currentUserState);
  const { deals } = data || {};

  const { list = [], pageInfo, totalCount = 0 } = deals || {};

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  useEffect(() => {
    const unsubscribe = subscribeToMore<any>({
      document: DEAL_LIST_CHANGED,
      variables: {
        pipelineId: lastPipelineId,
        userId: currentUser?._id,
        filter: options?.variables,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

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
          updatedList = currentList.map((item: IDeal) => {
            return item._id === deal._id ? { ...item, ...deal } : item;
          });
        }

        if (action === 'remove') {
          updatedList = currentList.filter(
            (item: IDeal) => item._id !== deal._id,
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
    optimisticResponse: ({ _id, name }) => ({
      dealsEdit: { __typename: 'Deal', _id, name },
    }),
    update: (cache, { data }) => {
      const updatedDeal = data?.dealsEdit;
      if (!updatedDeal) return;

      const existing = cache.readQuery<{ deals: IDealList }>({
        query: GET_DEALS,
      });
      if (!existing?.deals) return;

      cache.writeQuery({
        query: GET_DEALS,
        data: {
          deals: {
            ...existing.deals,
            list: existing.deals.list.map((d) =>
              d._id === updatedDeal._id ? { ...d, ...updatedDeal } : d,
            ),
          },
        },
      });
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

export function useDealsArchive(options?: MutationHookOptions<any, any>) {
  const [archiveDeals, { loading, error }] = useMutation(DEALS_ARCHIVE, {
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
        title: 'Successfully archived deals',
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
    archiveDeals,
    loading,
    error,
  };
}
