import { MutationHookOptions, useMutation, useApolloClient } from '@apollo/client';
import { productsRemoveMutation } from '../graphql/mutations/ProductRemoveMutations';
import { productsQueries } from '@/products/graphql';

export const useRemoveProducts = () => {
  const client = useApolloClient();
  const [_removeProducts, { loading }] = useMutation(productsRemoveMutation.productRemove);

  const removeProducts = async (
    productIds: string[],
    options?: MutationHookOptions,
  ) => {
    const result = await _removeProducts({
      ...options,
      variables: { productIds, ...options?.variables },
      update: (cache) => {
        cache.evict({ fieldName: 'productsMain' });
        cache.gc();
      },
    });

    if (result.data) {
      await client.refetchQueries({
        include: [productsQueries.productsMain],
      });
    }
  };

  return { removeProducts, loading };
};