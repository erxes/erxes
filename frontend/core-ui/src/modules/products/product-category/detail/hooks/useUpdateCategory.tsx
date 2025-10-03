import { OperationVariables, useMutation } from '@apollo/client';
import { productsMutations } from '@/products/graphql';

export const useProductCategoriesEdit = () => {
  const [_productCategoriesEdit, { loading }] = useMutation(productsMutations.categoryEdit);

  const productCategoriesEdit = (
    operationVariables: OperationVariables,
    fields: string[],
  ) => {
    const variables = operationVariables?.variables || {};
    const fieldsToUpdate: Record<string, () => any> = {};

    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });

    return _productCategoriesEdit({
      ...operationVariables,
      variables,
      update: (cache, { data }) => {
        const editedCategory = data?.productCategoriesEdit;
        if (!editedCategory) return;

        cache.modify({
          id: cache.identify(editedCategory),
          fields: fieldsToUpdate,
        });
      },
    });
  };

  return { productCategoriesEdit, loading };
};
