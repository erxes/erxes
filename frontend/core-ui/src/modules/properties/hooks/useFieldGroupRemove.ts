import { useMutation } from '@apollo/client';
import { FIELD_GROUP_REMOVE } from '../graphql/mutations/propertiesMutations';
import { toast } from 'erxes-ui';
import { FIELD_GROUPS_QUERY } from '../graphql/queries/propertiesQueries';

export const useFieldGroupRemove = ({
  contentType,
}: {
  contentType: string;
}) => {
  const [mutate, { loading }] = useMutation(FIELD_GROUP_REMOVE);

  const removeFieldGroup = (id: string) => {
    return mutate({
      variables: { id },
      onCompleted: () => {
        toast({
          title: 'Field group removed successfully',
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: [
        { query: FIELD_GROUPS_QUERY, variables: { params: { contentType } } },
      ],
    });
  };

  return {
    removeFieldGroup,
    loading,
  };
};
