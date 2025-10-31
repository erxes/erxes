import { MutationHookOptions, useMutation } from '@apollo/client';

import { byDateRemoveMutation } from '@/by-date/detail/graphql/mutations/ByDateRemoveMutations';
import { IByDate } from '@/by-date/types/ByDateType';
import { byDateQueries } from '@/by-date/graphql/ByDateQueries';

const BY_DATE_PAGE_SIZE = 30;

export const useRemoveByDate = () => {
  const [_removeByDate, { loading }] = useMutation(
    byDateRemoveMutation.byDateRemove,
  );

  const removeByDate = (byDateIds: string[], options?: MutationHookOptions) => {
    _removeByDate({
      ...options,
      variables: { byDateIds, ...options?.variables },
      update: (cache) => {
        try {
          cache.updateQuery(
            {
              query: byDateQueries.putResponsesByDate,
              variables: { perPage: BY_DATE_PAGE_SIZE },
            },
            ({ putResponsesByDate }) => ({
              putResponsesByDate: {
                ...putResponsesByDate,
                list: putResponsesByDate.list.filter(
                  (byDate: IByDate) => !byDateIds.includes(byDate._id),
                ),
                totalCount: Math.max(
                  0,
                  putResponsesByDate.totalCount - byDateIds.length,
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

  return { removeByDate, loading };
};
