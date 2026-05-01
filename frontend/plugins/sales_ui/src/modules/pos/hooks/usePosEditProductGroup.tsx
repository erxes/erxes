import { OperationVariables, useMutation } from '@apollo/client';
import { useCallback } from 'react';
import { mutations } from '../graphql';
import { cleanData } from '../utils/cleanData';

export const usePosEditProductGroup = () => {
  const [saveProductGroups, { loading }] = useMutation(
    mutations.saveProductGroups,
  );

  const productGroupSave = useCallback(
    (operationVariables: OperationVariables, fields: string[]) => {
      const rawVariables = operationVariables?.variables || {};
      const cleanedVariables = cleanData(rawVariables);

      const groups = Array.isArray(cleanedVariables.groups)
        ? cleanedVariables.groups.map((g: any) => {
            const rest = { ...(g || {}) };
            delete rest.posId;
            delete rest.__typename;
            return rest;
          })
        : cleanedVariables.groups;

      const variables = { ...cleanedVariables, groups };
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
    },
    [saveProductGroups],
  );

  return { productGroupSave, loading };
};
