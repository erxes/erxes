import { type MutationFunctionOptions, useMutation } from '@apollo/client';
import { useCallback } from 'react';
import type {
  ProductGroupsBulkInsertMutation,
  ProductGroupsBulkInsertMutationVariables,
} from '~/gql/graphql';
import { mutations, queries } from '../graphql';

type SaveOptions = MutationFunctionOptions<
  ProductGroupsBulkInsertMutation,
  ProductGroupsBulkInsertMutationVariables
>;

export const usePosEditProductGroup = () => {
  const [saveProductGroups, { loading }] = useMutation(
    mutations.saveProductGroups,
  );

  const productGroupSave = useCallback(
    (options: SaveOptions) => {
      const variables = options.variables;
      const groups = variables?.groups;
      let inputGroups = groups;
      if (groups != null) {
        inputGroups = (Array.isArray(groups) ? groups : [groups]).map(
          (group) => {
            if (group == null) return group;
            return {
              _id: group._id,
              categoryIds: group.categoryIds,
              excludedCategoryIds: group.excludedCategoryIds,
              excludedProductIds: group.excludedProductIds,
            };
          },
        );
      }
      return saveProductGroups({
        ...options,
        variables: variables
          ? {
              ...variables,
              groups: inputGroups,
            }
          : undefined,
        refetchQueries: variables
          ? [
              {
                query: queries.productGroups,
                variables: { posId: variables.posId },
              },
            ]
          : [],
        awaitRefetchQueries: true,
      });
    },
    [saveProductGroups],
  );

  return { productGroupSave, loading };
};
