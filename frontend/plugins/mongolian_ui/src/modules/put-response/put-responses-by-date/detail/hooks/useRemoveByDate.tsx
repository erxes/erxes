import { MutationHookOptions, useMutation } from '@apollo/client';
import { byDateRemoveMutation } from '@/put-response/put-responses-by-date/detail/graphql/mutations/ByDateRemoveMutations';
import { IByDate } from '@/put-response/put-responses-by-date/types/ByDateType';
import { byDateQueries } from '@/put-response/put-responses-by-date/graphql/ByDateQueries';

const BY_DATE_PAGE_SIZE = 30;

const updateCacheAfterDelete = (cache: any, byDateIds: string[]) => {
  try {
    const queryOptions = {
      query: byDateQueries.putResponsesByDate,
      variables: { perPage: BY_DATE_PAGE_SIZE },
    };

    const data = cache.readQuery(queryOptions);
    if (!data?.putResponsesByDate) return;

    const updatedList = data.putResponsesByDate.list.filter(
      (byDate: IByDate) => !byDateIds.includes(byDate._id),
    );

    cache.writeQuery({
      ...queryOptions,
      data: {
        putResponsesByDate: {
          ...data.putResponsesByDate,
          list: updatedList,
          totalCount: Math.max(
            0,
            data.putResponsesByDate.totalCount - byDateIds.length,
          ),
        },
      },
    });
  } catch (e) {
    console.error('Cache update failed:', e);
  }
};

export const useRemoveByDate = () => {
  const [_removeByDate, { loading }] = useMutation(
    byDateRemoveMutation.byDateRemove,
  );

  const removeByDate = (
    byDateIds: string[],
    options: MutationHookOptions = {},
  ) => {
    const mutationOptions = {
      ...options,
      variables: { byDateIds, ...options.variables },
      update: (cache: any) => updateCacheAfterDelete(cache, byDateIds),
    };

    _removeByDate(mutationOptions);
  };

  return { removeByDate, loading };
};
