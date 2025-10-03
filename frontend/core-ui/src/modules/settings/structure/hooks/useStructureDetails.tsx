import { useMutation, useQuery, type OperationVariables } from '@apollo/client';
import {
  ADD_STRUCTURE,
  EDIT_STRUCTURE,
  GET_STRUCTURE_DETAILS,
} from '../graphql';
import { useToast } from 'erxes-ui';

export const useStructureDetails = () => {
  const { data, loading, error } = useQuery(GET_STRUCTURE_DETAILS);
  const structureDetail = data?.structureDetail || {};

  return {
    structureDetail,
    loading,
    error,
  };
};

export const useEditStructureDetail = () => {
  const [edit, { loading, error }] = useMutation(EDIT_STRUCTURE);
  const { toast } = useToast();

  const handleEdit = (
    operationVariables: OperationVariables,
    fields: string[],
  ) => {
    const variables = operationVariables?.variables || {};

    const fieldsToUpdate: Record<string, () => any> = {};
    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });

    return edit({
      ...operationVariables,
      variables,
      update: (cache, { data }) => {
        const edited = data?.editStructure;
        if (!edited) return;

        cache.modify({
          id: cache.identify(edited),
          fields: fieldsToUpdate,
        });
      },
      onCompleted: () => {
        toast({ title: 'Updated' });
      },
      onError(error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { handleEdit, loading, error };
};

export const useAddStructureDetail = () => {
  const [add, { loading, error }] = useMutation(ADD_STRUCTURE);
  const { toast } = useToast();

  const handleAdd = (operationVariables: OperationVariables) => {
    const variables = operationVariables?.variables || {};

    return add({
      ...operationVariables,
      variables,
      onCompleted: () => {
        toast({ title: 'Created successfully!' });
      },
      onError(error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { handleAdd, loading, error };
};
