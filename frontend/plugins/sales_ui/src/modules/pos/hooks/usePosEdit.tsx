import { OperationVariables, useMutation } from '@apollo/client';
import { mutations } from '../graphql';

export const usePosEdit = () => {
  const [_posEdit, { loading }] = useMutation(mutations.posEdit);

  const posEdit = (
    operationVariables: OperationVariables,
    fields: string[],
  ) => {
    const variables = operationVariables?.variables || {};
    const fieldsToUpdate: Record<string, () => any> = {};

    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });

    return _posEdit({
      ...operationVariables,
      variables,
      update: (cache, { data }) => {
        const editedPos = data?.posEdit;
        if (!editedPos) return;

        cache.modify({
          id: cache.identify(editedPos),
          fields: fieldsToUpdate,
        });
      },
    });
  };

  return { posEdit, loading };
};