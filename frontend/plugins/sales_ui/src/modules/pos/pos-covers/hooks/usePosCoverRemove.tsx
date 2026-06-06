import { MutationHookOptions, useMutation, ApolloError } from '@apollo/client';
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

    const updatedList = data.posCovers.filter(
      (posCover: any) => !posCoverIds.includes(posCover._id),
    );

    cache.writeQuery({
      ...queryOptions,
      data: {
        posCovers: updatedList,
      },
    });
  } catch (e) {
    console.error('Cache update failed:', e);
  }
};

export const useRemovePosCover = () => {
  const [_removePosCover, { loading }] = useMutation(DELETE_POS_COVER_MUTATION);

  const removePosCover = async (
    posCoverIds: string[],
    options?: MutationHookOptions,
  ) => {
    try {
      for (let i = 0; i < posCoverIds.length; i++) {
        const id = posCoverIds[i];
        const isLast = i === posCoverIds.length - 1;

        await _removePosCover({
          variables: { id },
          update: isLast
            ? (cache) => updateCacheAfterRemove(cache, posCoverIds)
            : undefined,
        });
      }

      if (options?.onCompleted) {
        options.onCompleted(undefined, undefined);
      }
    } catch (error) {
      if (options?.onError) {
        options.onError(error as ApolloError);
      }
    }
  };

  return { removePosCover, loading };
};
