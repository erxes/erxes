import { useMutation } from '@apollo/client';
import { DELETE_POS_COVER_MUTATION } from '@/pos/pos-covers/graphql/mutations/posCoverMutation';

export const useDeletePosCover = () => {
  const [deletePosCover, { loading }] = useMutation(DELETE_POS_COVER_MUTATION);

  const removePosCover = async (
    posCoverIds: string | string[],
    options?: {
      onError?: (error: any) => void;
      onCompleted?: () => void;
      refetchQueries?: string[];
    },
  ) => {
    const ids = Array.isArray(posCoverIds) ? posCoverIds : [posCoverIds];

    await deletePosCover({
      variables: { ids },
      refetchQueries: options?.refetchQueries,
      onCompleted: options?.onCompleted,
      onError: options?.onError,
    });
  };

  return {
    removePosCover,
    loading,
  };
};
