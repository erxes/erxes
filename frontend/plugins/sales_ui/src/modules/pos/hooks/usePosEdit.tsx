import { OperationVariables, useMutation } from '@apollo/client';
import { mutations } from '../graphql';
import { cleanData } from '../utils/cleanData';

export const usePosEdit = () => {
  const [_posEdit, { loading: posEditLoading }] = useMutation(
    mutations.posEdit,
  );
  const [_saveProductGroups, { loading: productGroupsLoading }] = useMutation(
    mutations.saveProductGroups,
  );

  const posEdit = async (
    operationVariables: OperationVariables,
    fields: string[],
  ) => {
    const variables = operationVariables?.variables || {};

    const cleanedVariables = cleanData(variables);

    const fieldsToUpdate: Record<string, () => any> = {};

    fields.forEach((field) => {
      fieldsToUpdate[field] = () => cleanedVariables[field];
    });

    const posEditPromise = _posEdit({
      ...operationVariables,
      variables: cleanedVariables,
      update: (cache, { data }) => {
        const editedPos = data?.posEdit;
        if (!editedPos) return;

        cache.modify({
          id: cache.identify(editedPos),
          fields: fieldsToUpdate,
        });
      },
    });

    const productGroupsPromise = _saveProductGroups({
      variables: {
        posId: cleanedVariables._id,
        groups: cleanedVariables.productGroups || [],
      },
    });

    const [posEditResult] = await Promise.all([
      posEditPromise,
      productGroupsPromise,
    ]);
    return posEditResult;
  };

  return { posEdit, loading: posEditLoading || productGroupsLoading };
};
