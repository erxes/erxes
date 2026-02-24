import { productsMutations, productsQueries } from '@/products/graphql';
import { OperationVariables, useMutation } from '@apollo/client';
import { IProductCategory } from 'ui-modules';
import { useToast } from 'erxes-ui';

const normalizeCategoryIds = (categoryIds: string | string[]) => {
  const rawIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];

  return rawIds
    .flatMap((id) => id.split(','))
    .map((id) => id.trim())
    .filter(Boolean);
};

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

    const { onCompleted, onError, ...restOptions } = options || {};

    try {
      for (const id of ids) {
        await _removeCategory({
          ...restOptions,
          variables: {
            ...(restOptions as any)?.variables,
            _id: id,
          },
          update: (cache) => applyCacheCategoryRemoval(cache, [id]),
        });
      }

      toast({
        title: 'Success',
        description: 'Category removed successfully',
      });

      if (typeof onCompleted === 'function') {
        onCompleted();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });

      if (typeof onError === 'function') {
        onError(error);
      }
    }
  };

  return { removeCategory, loading };
};
