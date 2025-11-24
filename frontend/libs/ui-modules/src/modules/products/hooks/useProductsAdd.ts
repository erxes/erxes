import { useMutation, MutationHookOptions } from '@apollo/client';
import { PRODUCTS_ADD } from '../graphql/mutations/productMutations';

export function useAddProduct(
  options?: MutationHookOptions<{ productsAdd: { _id: string } }>,
) {
  const [productsAdd, { loading, error }] = useMutation<{
    productsAdd: { _id: string };
  }>(PRODUCTS_ADD, options);

  return { productsAdd, loading, error };
}
