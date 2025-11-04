import { MutationHookOptions, useMutation } from '@apollo/client';

import { duplicatedRemoveMutation } from '@/duplicated/detail/graphql/mutations/DuplicatedRemoveMutations';
import { duplicatedQueries } from '@/duplicated/graphql/DuplicatedQueries';
import { IDuplicated } from '@/duplicated/types/DuplicatedType';

const DUPLICATED_PAGE_SIZE = 30;

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
      update: (cache) => {
        try {
          cache.updateQuery(
            {
              query: duplicatedQueries.putResponsesDuplicated,
              variables: { perPage: DUPLICATED_PAGE_SIZE },
            },
            ({ putResponsesDuplicated }) => ({
              putResponsesDuplicated: {
                ...putResponsesDuplicated,
                list: putResponsesDuplicated.list.filter(
                  (duplicated: IDuplicated) =>
                    !duplicatedIds.includes(duplicated._id),
                ),
                totalCount: Math.max(
                  0,
                  putResponsesDuplicated.totalCount - duplicatedIds.length,
                ),
              },
            }),
          );
        } catch (e) {
          console.error('Cache update failed:', e);
        }
      },
    });
  };

  return { removeDuplicated, loading };
};
