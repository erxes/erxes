import { useMutation } from '@apollo/client';
import { FIELD_REMOVE } from '../graphql/mutations/propertiesMutations';
import { toast } from 'erxes-ui';
import { FIELDS_QUERY } from 'ui-modules';

export const useFieldRemove = ({ groupId }: { groupId: string }) => {
  const [removeField, { loading }] = useMutation(FIELD_REMOVE, {
    onCompleted: () => {
      toast({ title: 'Field removed successfully', variant: 'success' });
    },
    refetchQueries: [{ query: FIELDS_QUERY, variables: { groupId } }],
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
