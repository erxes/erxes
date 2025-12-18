import { useMutation } from '@apollo/client';
import { DELETE_PRODUCT_MUTATION } from '@/pos/pos-by-items/graphql/queries';

export const useDeleteProduct = () => {
  const [deleteProduct, { loading }] = useMutation(DELETE_PRODUCT_MUTATION);

  const removeProduct = async (
    productIds: string | string[],
    options?: {
      onError?: (error: any) => void;
      onCompleted?: () => void;
      refetchQueries?: string[];
    },
  ) => {
    const ids = Array.isArray(productIds) ? productIds : [productIds];

    await deleteProduct({
      variables: { ids },
      refetchQueries: options?.refetchQueries,
      onCompleted: options?.onCompleted,
      onError: options?.onError,
    });
  };

  return {
    removeProduct,
    loading,
  };
};
