import {
  ADD_DEALS,
  DEALS_ARCHIVE,
  DEALS_CHANGE,
  DEALS_COPY,
  DEALS_WATCH,
  EDIT_DEALS,
  REMOVE_DEALS,
} from '@/deals/graphql/mutations/DealsMutations';
import {
  EnumCursorDirection,
  ICursorListResponse,
  mergeCursorData,
  toast,
  useQueryState,
  validateFetchMore,
} from 'erxes-ui';
import {
  GET_DEALS,
  GET_DEAL_DETAIL,
} from '@/deals/graphql/queries/DealsQueries';
import {
  MutationHookOptions,
  QueryHookOptions,
  useMutation,
  useQuery,
} from '@apollo/client';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useMemo } from 'react';

import { DEAL_LIST_CHANGED } from '@/deals/graphql/subscriptions/dealListChange';
import { IDeal } from '@/deals/types/deals';
import { PRODUCTS_DATA_CHANGED } from '@/deals/graphql/subscriptions/productsSubscriptions';
import { currentUserState } from 'ui-modules';
import { dealCreateDefaultValuesState } from '@/deals/states/dealCreateSheetState';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';

interface IDealChanged {
  salesDealListChanged: {
    action: string;
    deal: IDeal;
  };
}

interface ISalesProductsDataChangedPayload {
  salesProductsDataChanged: {
    _id: string;
    processId: string;
    action: string;
    data: any;
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
            const merged = [...currentList, deal];
            merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            updatedList = merged;
          }
        }

        if (action === 'edit') {
          updatedList = currentList.map((item: IDeal) =>
            item._id === deal._id ? { ...item, ...deal } : item,
          );
          updatedList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesItemId]);

  return { deal: data?.dealDetail, loading, error, refetch };
};

export function useDealsEdit(options?: MutationHookOptions<any, any>) {
  const [_id] = useAtom(dealDetailSheetState);
  const [salesItemId] = useQueryState('salesItemId');

  const [editDeals, { loading, error }] = useMutation(EDIT_DEALS, {
    ...options,
    variables: {
      ...options?.variables,
      _id,
    },
    refetchQueries:
      salesItemId || _id
        ? [
            {
              query: GET_DEAL_DETAIL,
              variables: { ...options?.variables, _id: salesItemId || _id },
            },
          ]
        : [],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: 'Successfully updated a deal',
        variant: 'success',
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
  const [_id] = useAtom(dealDetailSheetState);
  const [defaultValues] = useAtom(dealCreateDefaultValuesState);

  const [addDeals, { loading, error }] = useMutation(ADD_DEALS, {
    ...options,
    variables: {
      ...options?.variables,
      _id,
      aboveItemId: '',
      stageId: defaultValues?.stageId,
    },
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
  const [_id] = useAtom(dealDetailSheetState);

  const [removeDeals, { loading, error }] = useMutation(REMOVE_DEALS, {
    ...options,
    variables: {
      ...options?.variables,
      _id,
    },
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
  const [archiveDealsBase, { loading, error }] = useMutation(DEALS_ARCHIVE, {
    ...options,
    variables: {
      ...options?.variables,
    },
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

  const archiveDeals = (stageId: string) =>
    archiveDealsBase({
      variables: { stageId },
      refetchQueries: [{ query: GET_DEALS, variables: { stageId } }],
    });

  return {
    archiveDeals,
    loading,
    error,
  };
}
export function useDealsCopy(options?: MutationHookOptions<any, any>) {
  const [_id] = useAtom(dealDetailSheetState);

  const [copyDeals, { loading, error }] = useMutation(DEALS_COPY, {
    ...options,
    variables: {
      ...options?.variables,
      _id,
    },
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: 'Successfully copied a deal',
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
    copyDeals,
    loading,
    error,
  };
}

export function useDealsWatch(options?: MutationHookOptions<any, any>) {
  const [_id] = useAtom(dealDetailSheetState);

  const [watchDeals, { loading, error }] = useMutation(DEALS_WATCH, {
    ...options,
    variables: {
      ...options?.variables,
      _id,
    },
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: 'Successfully updated watch status',
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
    watchDeals,
    loading,
    error,
  };
}
