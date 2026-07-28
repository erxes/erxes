import { MutationHookOptions, useMutation } from '@apollo/client';

import { productsMutations } from '@/products/graphql';

export const useProductsEdit = () => {
  const [productsEdit, { loading }] = useMutation(
    productsMutations.productsEdit,
  );

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    productsEdit({
      ...options,
      variables,
    });
  };

  return { productsEdit: mutate, loading };
};
