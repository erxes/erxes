import { productsMutations, productsQueries } from '@/products/graphql';
import { OperationVariables, useMutation } from '@apollo/client';
import { IProductCategory } from 'ui-modules';
import { useToast } from 'erxes-ui';

const normalizeCategoryIds = (categoryIds: string | string[]) =>
  Array.isArray(categoryIds) ? categoryIds : [categoryIds];

const filterOutCategories = (ids: string[]) => (category: IProductCategory) =>
  !ids.includes(category._id);

const getUpdatedCategories = (
  productCategories: IProductCategory[],
  ids: string[],
) => ({
  productCategories: productCategories.filter(filterOutCategories(ids)),
});

const applyCacheCategoryRemoval = (cache: any, ids: string[]) => {
  cache.updateQuery(
    {
      query: productsQueries.productCategories,
    },
    (data: { productCategories: IProductCategory[] } | null | undefined) => {
      if (!data?.productCategories) {
        return data;
      }
      return getUpdatedCategories(data.productCategories, ids);
    },
  );
};

export const useRemoveCategories = () => {
  const [_removeCategory, { loading }] = useMutation(
    productsMutations.categoryRemove,
  );
  const { toast } = useToast();

  const removeCategory = async (
    categoryIds: string | string[],
    options?: OperationVariables,
  ) => {
    const ids = normalizeCategoryIds(categoryIds);

    await _removeCategory({
      ...options,
      variables: {
        _id: categoryIds,
        ...options?.variables,
      },
      update: (cache) => applyCacheCategoryRemoval(cache, ids),
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
