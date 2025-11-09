import {
  ADD_DEALS,
  DEALS_ARCHIVE,
  DEALS_CHANGE,
  EDIT_DEALS,
  REMOVE_DEALS,
  DEALS_COPY,
  DEALS_WATCH,
} from '@/deals/graphql/mutations/DealsMutations';
import { gql } from 'graphql-tag';
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

import { DEAL_LIST_CHANGED } from '~/modules/deals/graphql/subscriptions/dealListChange';
import { IDeal } from '@/deals/types/deals';
import { currentUserState } from 'ui-modules';
import { dealCreateDefaultValuesState } from '@/deals/states/dealCreateSheetState';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useEffect } from 'react';

interface IDealChanged {
  salesDealListChanged: {
    action: string;
    deal: IDeal;
  };
}

interface UseDealsCopyOptions {
  onCompleted?: (data: any) => void;
  onError?: (error: any) => void;
  refetchQueries?: string[];
}

interface UseDealsWatchOptions {
  onCompleted?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useDealsWatch = (options?: UseDealsWatchOptions) => {
  const [dealsWatch, { data, loading, error }] = useMutation(DEALS_WATCH, {
    onCompleted: (data) => {
      options?.onCompleted?.(data);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Watch operation failed',
        variant: 'destructive',
      });
      options?.onError?.(error);
    },
  });

  const watchDeal = async (dealId: string, isAdd: boolean) => {
    const result = await dealsWatch({
      onCompleted: (data) => {
        toast({
          title: isAdd ? ' Watched' : 'Unwatched',
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      variables: {
        _id: dealId,
        isAdd,
      },
      optimisticResponse: {
        dealsWatch: {
          _id: dealId,
          isWatched: isAdd,
          __typename: 'Deal',
        },
      },
      update: (cache, { data: mutationData }) => {
        if (mutationData?.dealsWatch) {
          cache.modify({
            id: cache.identify({ __typename: 'Deal', _id: dealId }),
            fields: {
              isWatched() {
                return mutationData.dealsWatch.isWatched;
              },
            },
          });
        }
      },
    });
    return result;
  };

  return {
    watchDeal,
    data,
    loading,
    error,
  };
};

export const useDealsCopy = (options?: UseDealsCopyOptions) => {
  const [dealsCopy, { data, loading, error }] = useMutation(DEALS_COPY, {
    onCompleted: (data) => {
      toast({
        title: 'Successfully copied deal',
        variant: 'default',
      });
      options?.onCompleted?.(data);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Copy failed',
        variant: 'destructive',
      });
      options?.onError?.(error);
    },
    refetchQueries: options?.refetchQueries || ['deals', 'dealDetail'],
    awaitRefetchQueries: false,
    errorPolicy: 'all',
    update: (cache, { data: mutationData }) => {
      if (!mutationData?.dealsCopy) return;
      try {
        cache.modify({
          fields: {
            deals(existing) {
              if (!existing || !existing.list) return existing;
              const newDealRef = cache.writeFragment({
                data: mutationData.dealsCopy,
                fragment: gql`
                  fragment NewDeal on Deal {
                    _id
                    name
                    stageId
                  }
                `,
              });
              const existingList = existing.list as any[];
              const exists = existingList.some((ref) => {
                return (
                  (cache as any).readField('_id', ref) ===
                  mutationData.dealsCopy._id
                );
              });
              if (exists) return existing;
              return {
                ...existing,
                list: [newDealRef, ...existingList],
                totalCount: (existing.totalCount ?? 0) + 1,
              };
            },
          },
        });
      } catch (e) {
        console.error('Cache update error:', e);
      }
    },
  });

  const copyDeal = async (dealId: string, processId?: string) => {
    const result = await dealsCopy({
      variables: {
        _id: dealId,
        processId,
      },
    });

    if (result?.data?.dealsCopy) {
      return result;
    }

    // Check for GraphQL errors
    if (result?.errors?.[0]) {
      throw result.errors[0];
    }

    return result;
  };

  return {
    copyDeal,
    data,
    loading,
    error,
  };
};

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

  useEffect(() => {
    const unsubscribe = subscribeToMore<IDealChanged>({
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
          updatedList = currentList.map((item: IDeal) =>
            item._id === deal._id ? { ...item, ...deal } : item,
          );
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

  const { data, loading, error } = useQuery<{ dealDetail: IDeal }>(
    GET_DEAL_DETAIL,
    {
      ...options,
      variables: {
        ...options?.variables,
        _id: salesItemId || activeDealId,
      },
      skip: !activeDealId && !salesItemId,
    },
  );

  return { deal: data?.dealDetail, loading, error };
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
  const [_id] = useAtom(dealDetailSheetState);
  const [defaultValues] = useAtom(dealCreateDefaultValuesState);

  const [addDeals, { loading, error }] = useMutation(ADD_DEALS, {
    ...options,
    variables: {
      ...options?.variables,
      _id,
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
