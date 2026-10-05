import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PROPERTY_SYSTEM_FIELDS_LAYOUT_SAVE } from '../graphql/mutations/propertiesMutations';

export const useSystemFieldsLayoutSave = (
  contentType: string,
  onSaved: () => void,
) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const [mutate, { loading }] = useMutation(
    PROPERTY_SYSTEM_FIELDS_LAYOUT_SAVE,
    {
      // Forms read the layout through this query, so they redraw without a refresh.
      refetchQueries: ['PropertiesSystemFieldsLayout'],
      onCompleted: () => {
        toast({ title: t('layout-saved', 'Layout saved'), variant: 'success' });
        onSaved();
      },
      onError: (error) => {
        toast({
          title: t('error', 'Error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    },
  );

  // Null goes back to the layout the content type declares.
  const save = (layout: string[][] | null) =>
    mutate({ variables: { contentType, layout } });

  return { save, loading };
};
