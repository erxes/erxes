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
      update: (cache, { data: { productsEdit } }) => {
        cache.modify({
          id: cache.identify(productsEdit),
          fields: Object.keys(variables || {}).reduce((fields: any, field) => {
            fields[field] = () => (variables || {})[field];
            return fields;
          }, {}),
          optimistic: true,
        });
      },
    });
  };

  return { productsEdit: mutate, loading };
};
