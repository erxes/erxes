import { OperationVariables, useMutation } from '@apollo/client';
import { mutations } from '../graphql';
import { cleanData } from '../utils/cleanData';
import { useToast } from 'erxes-ui';

export const usePosEdit = () => {
  const [_posEdit, { loading: posEditLoading }] = useMutation(
    mutations.posEdit,
  );
  const [_saveProductGroups, { loading: productGroupsLoading }] = useMutation(
    mutations.saveProductGroups,
  );
  const { toast } = useToast();

  const posEdit = async (
    operationVariables: OperationVariables,
    fields: string[],
  ) => {
    const variables = operationVariables?.variables || {};

    const cleanedVariables = cleanData(variables);

    if (cleanedVariables.catProdMappings) {
      cleanedVariables.catProdMappings = cleanedVariables.catProdMappings.map(
        (mapping: any) => {
          const { _id, ...rest } = mapping;

          if (_id && !_id.startsWith('temp-')) {
            return { _id, ...rest };
          }
          return rest;
        },
      );
    }

    const { productGroups, ...posEditVariables } = cleanedVariables;

    const fieldsToUpdate: Record<string, () => any> = {};

    fields.forEach((field) => {
      fieldsToUpdate[field] = () => cleanedVariables[field];
    });

    const posEditPromise = _posEdit({
      ...operationVariables,
      variables: posEditVariables,
      update: (cache, { data }) => {
        const editedPos = data?.posEdit;
        if (!editedPos) return;

        cache.modify({
          id: cache.identify(editedPos),
          fields: fieldsToUpdate,
        });
      },
    });

    const cleanedGroupsRaw = cleanData(productGroups || []);
    const sanitizedGroups = Array.isArray(cleanedGroupsRaw)
      ? cleanedGroupsRaw.map((g: any) => {
          const { posId: _posId, __typename: _typename, ...rest } = g || {};
          return rest;
        })
      : cleanedGroupsRaw;

    try {
      const posEditResult = await posEditPromise;

      await _saveProductGroups({
        variables: {
          posId: cleanedVariables._id,
          groups: sanitizedGroups,
        },
      });

      toast({
        title: 'POS updated',
        description: 'Changes have been saved successfully.',
      });

      return posEditResult;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Please try again later.';
      toast({
        title: 'Failed to save changes',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return { posEdit, loading: posEditLoading || productGroupsLoading };
};
