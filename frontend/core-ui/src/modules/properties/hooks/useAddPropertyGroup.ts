import { useMutation } from '@apollo/client';
import { FIELD_GROUP_ADD } from '../graphql/mutations/propertiesMutations';
import { toast } from 'erxes-ui';
import { FIELD_GROUPS_QUERY } from 'ui-modules';
import { useParams } from 'react-router-dom';

export const useAddPropertyGroup = () => {
  const { type } = useParams<{ type: string }>();
  const [addPropertyGroup, { loading }] = useMutation(FIELD_GROUP_ADD, {
    refetchQueries: [
      {
        query: FIELD_GROUPS_QUERY,
        variables: { params: { contentType: type || '' } },
      },
    ],
    onCompleted: () => {
      toast({ title: 'Created a group', variant: 'success' });
    },
    onError: (error) => {
      toast({
        title: 'Failed to create a group',
        variant: 'destructive',
        description: error.message,
      });
    },
  });

  return {
    addPropertyGroup,
    loading,
  };
};
