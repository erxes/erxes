import { useMutation } from '@apollo/client';
import { FIELD_GROUP_ADD } from '../graphql/mutations/propertiesMutations';
import { toast } from 'erxes-ui';
import { FIELD_GROUPS_QUERY } from 'ui-modules';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const useAddPropertyGroup = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { type } = useParams<{ type: string }>();
  const [addPropertyGroup, { loading }] = useMutation(FIELD_GROUP_ADD, {
    refetchQueries: [
      {
        query: FIELD_GROUPS_QUERY,
        variables: { params: { contentType: type || '' } },
      },
    ],
    onCompleted: () => {
      toast({ title: t('group-created', 'Created a group'), variant: 'success' });
    },
    onError: (error) => {
      toast({
        title: t('group-create-failed', 'Failed to create a group'),
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
