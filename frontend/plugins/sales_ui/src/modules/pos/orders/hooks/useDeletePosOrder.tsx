import { useMutation } from '@apollo/client';
import { DELETE_POS_ORDER_MUTATION } from '@/pos/orders/graphql/mutations/deletePosOrderMutations';

export const useDeletePosOrder = () => {
  const [deletePosOrder, { loading }] = useMutation(DELETE_POS_ORDER_MUTATION);

  const removePosOrder = async (
    posOrderIds: string | string[],
    options?: {
      onError?: (error: any) => void;
      onCompleted?: () => void;
      refetchQueries?: string[];
    },
  ) => {
    const ids = Array.isArray(posOrderIds) ? posOrderIds : [posOrderIds];

    await deletePosOrder({
      variables: { ids },
      refetchQueries: options?.refetchQueries,
      onCompleted: options?.onCompleted,
      onError: options?.onError,
    });
  };

  return {
    removePosOrder,
    loading,
  };
};
