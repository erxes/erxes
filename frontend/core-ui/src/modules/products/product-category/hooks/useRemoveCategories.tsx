import { productsMutations } from '@/products/graphql';
import { ApolloError, OperationVariables, useMutation } from '@apollo/client';
import { useState } from 'react';

const normalizeCategoryIds = (categoryIds: string | string[]) => {
  const rawIds = Array.isArray(categoryIds) ? categoryIds : [categoryIds];

  return [
    ...new Set(
      rawIds
        .flatMap((id) => id.split(','))
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];
};

const getErrorDedupeKey = (message: string) =>
  message.replace(/category "[^"]+"/, 'category').replace(/\d+/g, '{count}');

const getMutationErrorMessage = (error: unknown) => {
  if (error instanceof ApolloError) {
    return (
      error.graphQLErrors[0]?.message ||
      error.networkError?.message ||
      error.message
    );
  }

  return error instanceof Error ? error.message : 'Unknown error';
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
      const results = await Promise.allSettled(
        ids.map((id) =>
          _removeCategory({
            variables: {
              ...(variables as OperationVariables),
              _id: id,
            },
            update: (cache) => {
              cache.evict({ fieldName: 'productCategories' });
              cache.evict({ fieldName: 'productCategoriesTotalCount' });
              cache.gc();
            },
          }),
        ),
      );

      const succeededIds: string[] = [];
      const errorMessages = new Map<string, string>();

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          succeededIds.push(ids[index]);
        } else {
          const errorMessage = getMutationErrorMessage(result.reason);
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
