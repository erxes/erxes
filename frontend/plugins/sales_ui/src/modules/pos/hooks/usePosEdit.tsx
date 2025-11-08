import { OperationVariables, useMutation } from '@apollo/client';
import { mutations } from '../graphql';

const cleanData = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(cleanData);
  }
  
  if (typeof data === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === '__typename') continue;
      if (key === '_id' && value === null) continue;
      
      cleaned[key] = cleanData(value);
    }
    return cleaned;
  }
  
  return data;
};

export const usePosEdit = () => {
  const [_posEdit, { loading: posEditLoading }] = useMutation(mutations.posEdit);
  const [_saveProductGroups, { loading: productGroupsLoading }] = useMutation(mutations.saveProductGroups);

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
    
    const [posEditResult] = await Promise.all([posEditPromise, productGroupsPromise]);
    return posEditResult;
  };

  return { posEdit, loading: posEditLoading || productGroupsLoading };
};