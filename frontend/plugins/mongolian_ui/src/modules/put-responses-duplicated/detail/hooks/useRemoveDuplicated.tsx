import { MutationHookOptions, useMutation } from '@apollo/client';
import { duplicatedRemoveMutation } from '@/put-responses-duplicated/detail/graphql/mutations/DuplicatedRemoveMutations';
import { duplicatedQueries } from '@/put-responses-duplicated/graphql/DuplicatedQueries';
import { IDuplicated } from '@/put-responses-duplicated/types/DuplicatedType';

const DUPLICATED_PAGE_SIZE = 30;

const updateCacheAfterRemove = (cache: any, duplicatedIds: string[]) => {
  try {
    cache.updateQuery(
      {
        query: duplicatedQueries.putResponsesDuplicated,
        variables: { perPage: DUPLICATED_PAGE_SIZE },
      },
      ({ putResponsesDuplicated }: { putResponsesDuplicated: any }) => {
        const newList = putResponsesDuplicated.list.filter(
          (duplicated: IDuplicated) => !duplicatedIds.includes(duplicated._id),
        );

        return {
          putResponsesDuplicated: {
            ...putResponsesDuplicated,
            list: newList,
            totalCount: Math.max(
              0,
              putResponsesDuplicated.totalCount - duplicatedIds.length,
            ),
          },
        };
      },
    );
  } catch (e) {
    console.error('Cache update failed:', e);
  }
};

export const useRemoveDuplicated = () => {
  const [_removeDuplicated, { loading }] = useMutation(
    duplicatedRemoveMutation.duplicatedRemove,
  );

  const removeDuplicated = (
    duplicatedIds: string[],
    options?: MutationHookOptions,
  ) => {
    _removeDuplicated({
      ...options,
      variables: { duplicatedIds, ...options?.variables },
      update: (cache) => updateCacheAfterRemove(cache, duplicatedIds),
    });
  };

  return { removeDuplicated, loading };
};
