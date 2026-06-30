import { useMutation } from '@apollo/client';
import { FIELD_GROUP_REMOVE } from '../graphql/mutations/propertiesMutations';
import { toast } from 'erxes-ui';
import { FIELD_GROUPS_QUERY } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const useFieldGroupRemove = ({
  contentType,
}: {
  contentType: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const [mutate, { loading }] = useMutation(FIELD_GROUP_REMOVE);

  const removeFieldGroup = (id: string) => {
    return mutate({
      variables: { id },
      onCompleted: () => {
        toast({
          title: t('field-group-removed', 'Field group removed successfully'),
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: t('error', 'Error'),
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
