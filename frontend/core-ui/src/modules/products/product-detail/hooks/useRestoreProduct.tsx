import { ApolloError, useApolloClient, useMutation } from '@apollo/client';
import { productsMutations, productsQueries } from '@/products/graphql';

export const useRestoreProducts = () => {
  const client = useApolloClient();
  const [_restoreProduct, { loading }] = useMutation(
    productsMutations.productsEdit,
  );

  const restoreProducts = async (
    productIds: string[],
    callbacks?: {
      onCompleted?: () => void;
      onError?: (error: ApolloError) => void;
    },
  ) => {
    try {

      await Promise.all(
        productIds.map((_id) => _restoreProduct({ variables: { _id } })),
      );

      client.cache.evict({ fieldName: 'productsMain' });
      client.cache.gc();
      await client.refetchQueries({
        include: [productsQueries.productsMain],
      });

      callbacks?.onCompleted?.();
    } catch (error) {
      callbacks?.onError?.(error as ApolloError);
    }
  };

  return { restoreProducts, loading };
};
