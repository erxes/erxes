import { updateCacheAfterRemove } from '@/pos/utils/updatePosCoversCache';
import { ApolloError, useMutation } from '@apollo/client';
import { DELETE_POS_COVER_MUTATION } from '../graphql/mutations/posCoverMutation';

export const useRemovePosCover = () => {
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
    }
  };

  return { removePosCover, loading };
};
