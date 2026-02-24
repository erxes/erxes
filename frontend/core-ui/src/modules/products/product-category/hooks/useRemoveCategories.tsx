import { productsMutations, productsQueries } from '@/products/graphql';
import { OperationVariables, useMutation } from '@apollo/client';
import { IProductCategory } from 'ui-modules';

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

  const removeCategory = async (
    categoryIds: string | string[],
    options?: OperationVariables & {
      onCompleted?: (succeededIds: string[]) => void;
      onError?: (result: { succeededIds: string[]; errors: any[] }) => void;
    },
  ) => {
    const ids = normalizeCategoryIds(categoryIds);

    const { onCompleted, onError, ...restOptions } = options || {};

    const succeededIds: string[] = [];
    const errors: any[] = [];

    for (const id of ids) {
      try {
        await _removeCategory({
          ...restOptions,
          variables: {
            ...(restOptions.variables as OperationVariables),
            _id: id,
          },
          update: (cache) => applyCacheCategoryRemoval(cache, [id]),
        });
        succeededIds.push(id);
      } catch (error) {
        errors.push(error);
      }
    }

    if (errors.length === 0) {
      if (typeof onCompleted === 'function') {
        onCompleted(succeededIds);
      }
    } else {
      if (typeof onError === 'function') {
        onError({ succeededIds, errors });
      }
    }
  };

  return { removeCategory, loading };
};
