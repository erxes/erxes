import { useMutation } from '@apollo/client';
import { gql } from 'graphql-tag';
import {
  DEALS_ARCHIVE,
  DEALS_COPY,
  DEALS_WATCH,
  DEALS_CHANGE,
  REMOVE_DEALS,
} from '@/deals/graphql/mutations/DealsMutations';

interface UseDealsCopyOptions {
  onCompleted?: (data: any) => void;
  onError?: (error: any) => void;
  refetchQueries?: string[];
}

export const useDealsCopy = (options?: UseDealsCopyOptions) => {
  const [dealsCopy, { data, loading, error }] = useMutation(DEALS_COPY, {
    onCompleted: (data) => {
      options?.onCompleted?.(data);
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
        console.warn('dealsCopy cache update skipped:', e);
      }
    },
  });

  const copyDeal = async (dealId: string, processId?: string) => {
    try {
      const result = await dealsCopy({
        variables: {
          _id: dealId,
          processId,
        },
      });
      if (result?.data?.dealsCopy) {
        return result;
      }
      const firstError = (result as any)?.errors?.[0];
      if (firstError) {
        throw firstError;
      }
      return result;
    } catch (err) {
      console.error('Copy deal error:', err);
      options?.onError?.(err);
      throw err;
    }
  };

  return {
    copyDeal,
    data,
    loading,
    error,
  };
};

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
      options?.onError?.(error);
    },
  });

  const watchDeal = async (dealId: string, isAdd: boolean) => {
    try {
      const result = await dealsWatch({
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
    } catch (err) {
      console.error('Watch deal error:', err);
      throw err;
    }
  };

  return {
    watchDeal,
    data,
    loading,
    error,
  };
};

interface UseDealsArchiveOptions {
  onCompleted?: (data: any) => void;
  onError?: (error: any) => void;
  refetchQueries?: string[];
}

export const useDealsArchive = (options?: UseDealsArchiveOptions) => {
  const [dealsArchive, { data, loading, error }] = useMutation(DEALS_ARCHIVE, {
    onCompleted: (data) => {
      options?.onCompleted?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
    refetchQueries: options?.refetchQueries || ['deals', 'stages'],
    awaitRefetchQueries: true,
  });

  const archiveDeal = async (stageId: string, processId?: string) => {
    try {
      const result = await dealsArchive({
        variables: {
          stageId,
          processId,
        },
      });
      return result;
    } catch (err) {
      console.error('Archive deal error:', err);
      throw err;
    }
  };

  return {
    archiveDeal,
    data,
    loading,
    error,
  };
};

interface UseDealsChangeOptions {
  onCompleted?: (data: any) => void;
  onError?: (error: any) => void;
  refetchQueries?: string[];
}

export const useDealsChange = (options?: UseDealsChangeOptions) => {
  const [dealsChange, { data, loading, error }] = useMutation(DEALS_CHANGE, {
    onCompleted: (data) => {
      options?.onCompleted?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
    refetchQueries: options?.refetchQueries || ['deals', 'dealDetail'],
    awaitRefetchQueries: true,
  });

  const changeDeal = async (
    itemId: string,
    destinationStageId: string,
    changeOptions?: {
      aboveItemId?: string;
      sourceStageId?: string;
      processId?: string;
    },
  ) => {
    try {
      const result = await dealsChange({
        variables: {
          itemId,
          destinationStageId,
          aboveItemId: changeOptions?.aboveItemId,
          sourceStageId: changeOptions?.sourceStageId,
          processId: changeOptions?.processId,
        },
      });
      return result;
    } catch (err) {
      console.error('Change deal error:', err);
      throw err;
    }
  };

  return {
    changeDeal,
    data,
    loading,
    error,
  };
};

interface UseDealsRemoveOptions {
  onCompleted?: (data: any) => void;
  onError?: (error: any) => void;
  refetchQueries?: string[];
}

export const useDealsRemove = (options?: UseDealsRemoveOptions) => {
  const [dealsRemove, { data, loading, error }] = useMutation(REMOVE_DEALS, {
    onCompleted: (data) => {
      options?.onCompleted?.(data);
    },
    onError: (error) => {
      options?.onError?.(error);
    },
    refetchQueries: options?.refetchQueries || ['deals', 'stages'],
    awaitRefetchQueries: true,
    update: (cache, { data: mutationData }) => {
      if (mutationData?.dealsRemove) {
        cache.evict({
          id: cache.identify({
            __typename: 'Deal',
            _id: mutationData.dealsRemove._id,
          }),
        });
        cache.gc();
      }
    },
  });

  const removeDeal = async (dealId: string) => {
    try {
      const result = await dealsRemove({
        variables: {
          _id: dealId,
        },
      });
      return result;
    } catch (err) {
      console.error('Remove deal error:', err);
      throw err;
    }
  };

  return {
    removeDeal,
    data,
    loading,
    error,
  };
};

// Combined hook for all deal actions
export const useDealsActions = () => {
  const copyHook = useDealsCopy();
  const watchHook = useDealsWatch();
  const archiveHook = useDealsArchive();
  const changeHook = useDealsChange();
  const removeHook = useDealsRemove();

  return {
    copy: copyHook,
    watch: watchHook,
    archive: archiveHook,
    change: changeHook,
    remove: removeHook,
    loading:
      copyHook.loading ||
      watchHook.loading ||
      archiveHook.loading ||
      changeHook.loading ||
      removeHook.loading,
  };
};
