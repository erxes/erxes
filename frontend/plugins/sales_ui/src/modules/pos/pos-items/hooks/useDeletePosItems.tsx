import { useMutation } from '@apollo/client';
import { DELETE_POS_ITEMS_MUTATION } from '~/modules/pos/pos-items/graphql/mutations/posItemsDeleteMutation';

export const useDeletePosItems = () => {
  const [deletePosItems, { loading }] = useMutation(DELETE_POS_ITEMS_MUTATION);

  const removePosItems = async (
    posItemsIds: string | string[],
    options?: {
      onError?: (error: any) => void;
      onCompleted?: () => void;
      refetchQueries?: string[];
    },
  ) => {
    const ids = Array.isArray(posItemsIds) ? posItemsIds : [posItemsIds];

    await deletePosItems({
      variables: { ids },
      refetchQueries: options?.refetchQueries,
      onCompleted: options?.onCompleted,
      onError: options?.onError,
    });
  };

  return {
    removePosItems,
    loading,
  };
};
