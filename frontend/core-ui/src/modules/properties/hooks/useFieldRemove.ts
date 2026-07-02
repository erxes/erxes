import { useMutation } from '@apollo/client';
import { FIELD_REMOVE } from '../graphql/mutations/propertiesMutations';
import { toast } from 'erxes-ui';
import { FIELDS_QUERY } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const useFieldRemove = ({
  groupId,
  contentType,
}: {
  groupId: string;
  contentType: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const [removeField, { loading }] = useMutation(FIELD_REMOVE, {
    onCompleted: () => {
      toast({ title: t('field-removed', 'Field removed successfully'), variant: 'success' });
    },
    refetchQueries: [
      {
        query: FIELDS_QUERY,
        variables: { params: { groupId, contentType } },
      },
    ],
    onError: (error) => {
      toast({
        title: t('error', 'Error'),
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
