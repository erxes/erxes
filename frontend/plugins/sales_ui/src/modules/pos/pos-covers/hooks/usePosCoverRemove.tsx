import { MutationHookOptions, useMutation } from '@apollo/client';
import { DELETE_POS_COVER_MUTATION } from '../graphql/mutations/posCoverMutation';
import { posCovers } from '../graphql/queries/queries';

const POS_COVER_PAGE_SIZE = 30;

const updateCacheAfterRemove = (cache: any, posCoverIds: string[]) => {
  try {
    const queryOptions = {
      query: posCovers,
      variables: { perPage: POS_COVER_PAGE_SIZE },
    };

    const data = cache.readQuery(queryOptions);
    if (!data?.posCovers) return;

    const updatedList = data.posCovers.list.filter(
      (posCover: any) => !posCoverIds.includes(posCover._id),
    );

    const updatedTotalCount = Math.max(
      0,
      data.posCovers.totalCount - posCoverIds.length,
    );

    cache.writeQuery({
      ...queryOptions,
      data: {
        posCovers: {
          ...data.posCovers,
          list: updatedList,
          totalCount: updatedTotalCount,
        },
      },
    });
  } catch (e) {
    console.error('Cache update failed:', e);
  }
};

export const useRemovePosCover = () => {
  const [_removePosCover, { loading }] = useMutation(DELETE_POS_COVER_MUTATION);

  const removePosCover = (
    posCoverIds: string[],
    options?: MutationHookOptions,
  ) => {
    _removePosCover({
      ...options,
      variables: { id: posCoverIds[0], ...options?.variables },
      update: (cache) => updateCacheAfterRemove(cache, posCoverIds),
    });
  };

  return { removePosCover, loading };
};
