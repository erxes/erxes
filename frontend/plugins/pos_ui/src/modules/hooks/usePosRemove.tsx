import { OperationVariables, useMutation } from '@apollo/client';
import { IPos } from '../types/pos';
import { mutations, queries } from '../graphql';

export const useRemovePos = () => {
  const [_removePos, { loading, error }] = useMutation(mutations.posRemove);

  const removePos = async (
    posIds: string | string[],
    options?: OperationVariables,
  ) => {
    const idsArray = Array.isArray(posIds) ? posIds : [posIds];
    
    try {
      await _removePos({
        ...options,
        variables: {
          _id: posIds,
          ...options?.variables
        },
        update: (cache) => {
          try {
            const queryVariables = options?.queryVariables || { 
              perPage: 30, 
              dateFilters: null 
            };

            cache.updateQuery(
              {
                query: queries.posList,
                variables: queryVariables,
              },
              (data) => {
                if (!data?.posMain) return data;

                const { posMain } = data;
                const filteredList = posMain.list.filter(
                  (pos: IPos) => !idsArray.includes(pos._id)
                );

                const removedCount = posMain.list.length - filteredList.length;

                return {
                  posMain: {
                    ...posMain,
                    list: filteredList,
                    totalCount: Math.max(0, posMain.totalCount - removedCount),
                  },
                };
              },
            );
          } catch (cacheError) {
            console.warn('Failed to update cache after pos removal:', cacheError);
          }
        },
        optimisticResponse: {
          posRemove: {
            __typename: 'Mutation',
            success: true,
          },
        },
      });
    } catch (mutationError) {
      console.error('Failed to remove pos:', mutationError);
      throw mutationError;
    }
  };

  return { 
    removePos, 
    loading, 
    error 
  };
};