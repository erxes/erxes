import { useMutation } from '@apollo/client';
import { FIELD_REMOVE } from '../graphql/mutations/propertiesMutations';
import { toast } from 'erxes-ui';

export const useFieldRemove = () => {
  const [removeField, { loading }] = useMutation(FIELD_REMOVE, {
    onCompleted: () => {
      toast({ title: 'Field removed successfully', variant: 'success' });
    },
    refetchQueries: ['Fields'],
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    removeField,
    loading,
  };
};
