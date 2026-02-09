import { productsMutations, productsQueries } from '@/products/graphql';
import { OperationVariables, useMutation } from '@apollo/client';
import { IProductCategory } from 'ui-modules';
import { useToast } from 'erxes-ui';

export const useRemoveCategories = () => {
  const [_removeCategory, { loading }] = useMutation(
    productsMutations.categoryRemove,
  );
  const { toast } = useToast();

  const removeCategory = async (
    categoryIds: string | string[],
    options?: OperationVariables,
  ) => {
    await _removeCategory({
      ...options,
      variables: {
        _id: categoryIds,
        ...options?.variables,
      },
      update: (cache) => {
        try {
          cache.updateQuery(
            {
              query: productsQueries.productCategories,
            },
            ({ productCategories }) => {
              const ids = Array.isArray(categoryIds)
                ? categoryIds
                : [categoryIds];
              return {
                productCategories: productCategories.filter(
                  (category: IProductCategory) => !ids.includes(category._id),
                ),
              };
            },
          );
        } catch (e) {
          console.log(e);
        }
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Category removed successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { removeCategory, loading };
};
