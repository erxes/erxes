import {
  ApolloCache,
  ApolloError,
  FetchResult,
  OperationVariables,
  useMutation,
} from '@apollo/client';
import { IPos } from '../types/pos';
import { mutations, queries } from '../graphql';

type RemovePosOptions = {
  variables?: OperationVariables;
  queryVariables?: OperationVariables;
  onCompleted?: (results?: FetchResult[]) => void;
  onError?: (error: ApolloError) => void;
};

const updateCacheAfterRemoval = (
  cache: ApolloCache<unknown>,
  id: string,
  queryVariables?: OperationVariables,
) => {
  try {
    const variables = queryVariables || {
      perPage: 30,
      dateFilters: null,
    };

    cache.updateQuery(
      {
        query: queries.posList,
        variables,
      },
      (data: any) => {
        if (!data?.posList) return data;

        const filteredList = (data.posList as IPos[]).filter(
          (pos: IPos) => pos._id !== id,
        );

        return {
          ...data,
          posList: filteredList,
        };
      },
    );
  } catch (cacheError) {
    console.warn('Failed to update cache after pos removal:', cacheError);
  }
};

export const useRemovePos = () => {
  const [_removePos, { loading, error }] = useMutation(mutations.posRemove);

  const removePos = async (
    posIds: string | string[],
    options?: RemovePosOptions,
  ) => {
    const { onCompleted, onError, variables, queryVariables } = options || {};
    let idsArray: string[] = [];
    if (typeof posIds === 'string') {
      idsArray = posIds.includes(',')
        ? posIds.split(',').map((id) => id.trim())
        : [posIds];
    } else {
      idsArray = posIds;
    }

    try {
      const mutationResults = await Promise.all(
        idsArray.map((id) =>
          _removePos({
            variables: {
              ...variables,
              _id: id,
            },
            update: (cache) =>
              updateCacheAfterRemoval(cache, id, queryVariables),
            optimisticResponse: { posRemove: 'success' },
          }),
        ),
      );

      onCompleted?.(mutationResults);
    } catch (mutationError) {
      console.error('Failed to remove pos:', mutationError);

      const errorToReport =
        mutationError instanceof ApolloError
          ? mutationError
          : new ApolloError({
              errorMessage:
                mutationError instanceof Error
                  ? mutationError.message
                  : String(mutationError),
            });

      onError?.(errorToReport);

      throw errorToReport;
    }
  };

  return {
    removePos,
    loading,
    error,
  };
};
