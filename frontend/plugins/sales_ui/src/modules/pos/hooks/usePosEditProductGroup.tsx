import { OperationVariables, useMutation, useQuery } from '@apollo/client';
import { mutations, queries } from '../graphql';

export const usePosEditProductGroup = () => {
  const [saveProductGroups, { loading }] = useMutation(
    mutations.saveProductGroups,
  );

  const productGroupSave = (
    operationVariables: OperationVariables,
    fields: string[],
  ) => {
    const variables = operationVariables?.variables || {};
    const fieldsToUpdate: Record<string, () => any> = {};

    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });

    return saveProductGroups({
      ...operationVariables,
      variables,
      update: (cache, { data }) => {
        const productGroupsBulkInsert = data?.productGroupsBulkInsert;
        if (!productGroupsBulkInsert) return;

        cache.modify({
          id: cache.identify(productGroupsBulkInsert),
          fields: fieldsToUpdate,
        });
      },
    });
  };

  return { productGroupSave, loading };
};
