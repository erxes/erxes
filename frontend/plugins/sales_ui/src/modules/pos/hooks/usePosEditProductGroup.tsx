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
      return saveProductGroups({
        ...options,
        variables: variables
          ? {
              ...variables,
              groups:
                groups == null
                  ? groups
                  : (Array.isArray(groups) ? groups : [groups]).map((group) =>
                      group == null
                        ? group
                        : {
                            _id: group._id,
                            categoryIds: group.categoryIds,
                            excludedCategoryIds: group.excludedCategoryIds,
                            excludedProductIds: group.excludedProductIds,
                          },
                    ),
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
