import { productsMutations } from '@/products/graphql';
import { ApolloCache, OperationVariables, useMutation } from '@apollo/client';
import { useState } from 'react';

const normalizeCategoryIds = (categoryIds: string | string[]) => {
  const rawIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];

  return rawIds
    .flatMap((id) => id.split(','))
    .map((id) => id.trim())
    .filter(Boolean);
};

const getErrorDedupeKey = (message: string) =>
  message.replace(/category "[^"]+"/, 'category').replace(/\d+/g, '{count}');

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
  const [_removeCategory] = useMutation(productsMutations.categoryRemove);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  const removeCategory = async (
    categoryIds: string | string[],
    options?: RemoveCategoryOptions,
  ) => {
    const ids = normalizeCategoryIds(categoryIds);

    const { variables, onCompleted, onError } = options || {};

    setIsRemoving(true);

    try {
      let mutationCache: ApolloCache<unknown> | null = null;

      const results = await Promise.allSettled(
        ids.map((id) =>
          _removeCategory({
            variables: {
              ...(variables as OperationVariables),
              _id: id,
            },
            update: (cache) => {
              mutationCache = cache;
              cache.evict({ fieldName: 'productCategories' });
              cache.evict({ fieldName: 'productCategoriesTotalCount' });
            },
          }),
        ),
      );

      mutationCache?.gc();

      const succeededIds: string[] = [];
      const errorMessages = new Map<string, string>();

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          succeededIds.push(ids[index]);
        } else {
          const errorMessage =
            result.reason instanceof Error
              ? result.reason.message
              : 'Unknown error';
          errorMessages.set(getErrorDedupeKey(errorMessage), errorMessage);
        }
      });

      const errors = Array.from(errorMessages.values(), (message) => ({
        message,
      }));

      if (errors.length > 0) {
        onError?.({ succeededIds, errors });
      } else {
        onCompleted?.(succeededIds);
      }
    } finally {
      setIsRemoving(false);
    }
  };

  return { removeCategory, loading: isRemoving };
};
