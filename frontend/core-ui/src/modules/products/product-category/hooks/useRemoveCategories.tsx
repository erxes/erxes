import { productsMutations, productsQueries } from '@/products/graphql';
import { OperationVariables, useMutation, ApolloCache } from '@apollo/client';
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

const applyCacheCategoryRemoval = (cache: ApolloCache<any>, ids: string[]) => {
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

interface RemoveError {
  message: string;
}

interface RemoveErrorResult {
  succeededIds: string[];
  errors: RemoveError[];
}

interface RemoveCategoryOptions {
  variables?: OperationVariables;
  onCompleted?: (succeededIds: string[]) => void;
  onError?: (result: RemoveErrorResult) => void;
}

export const useRemoveCategories = () => {
  const [_removeCategory, { loading }] = useMutation(
    productsMutations.categoryRemove,
  );

  const removeCategory = async (
    categoryIds: string | string[],
    options?: RemoveCategoryOptions,
  ) => {
    const ids = normalizeCategoryIds(categoryIds);

    const { variables, onCompleted, onError } = options || {};

    const succeededIds: string[] = [];
    const errors: RemoveError[] = [];

    for (const id of ids) {
      try {
        await _removeCategory({
          variables: {
            ...(variables as OperationVariables),
            _id: id,
          },
          update: (cache) => applyCacheCategoryRemoval(cache, [id]),
        });
        succeededIds.push(id);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push({ message: errorMessage });
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
