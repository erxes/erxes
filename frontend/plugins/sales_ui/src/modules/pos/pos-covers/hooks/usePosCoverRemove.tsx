import { updateCacheAfterRemove } from '@/pos/utils/updatePosCoversCache';
import { ApolloError, useApolloClient, useMutation } from '@apollo/client';
import { DELETE_POS_COVER_MUTATION } from '@/pos/pos-covers/graphql/mutations/posCoverMutation';
import { posCovers } from '@/pos/pos-covers/graphql/queries/queries';

export const useRemovePosCover = () => {
  const client = useApolloClient();
  const [_removePosCover, { loading }] = useMutation(DELETE_POS_COVER_MUTATION);

  const removePosCover = async (
    posCoverIds: string[],
    options?: {
      onCompleted?: () => void;
      onError?: (error: ApolloError) => void;
    },
  ) => {
    try {
      for (const id of posCoverIds) {
        await _removePosCover({
          variables: { id },
          update: (cache) => updateCacheAfterRemove(cache, [id]),
        });
      }
      options?.onCompleted?.();
    } catch (error) {
      options?.onError?.(
        error instanceof ApolloError
          ? error
          : new ApolloError({
              errorMessage:
                error instanceof Error ? error.message : String(error),
            }),
      );
    } finally {
      client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'posCoversCount' });
      client.cache.gc();
      await client
        .refetchQueries({ include: [posCovers] })
        .catch(() => undefined);
    }
  };

  return { removePosCover, loading };
};
