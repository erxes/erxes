import { useMutation } from '@apollo/client';
import { FIELD_GROUP_ADD } from '../graphql/mutations/propertiesMutations';
import { toast, useQueryState } from 'erxes-ui';
import { FIELD_GROUPS_QUERY } from 'ui-modules';

export const useAddPropertyGroup = () => {
  const [contentType] = useQueryState<string>('type');
  const [addPropertyGroup, { loading }] = useMutation(FIELD_GROUP_ADD, {
    refetchQueries: [
      {
        query: FIELD_GROUPS_QUERY,
        variables: { params: { contentType: contentType || '' } },
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
