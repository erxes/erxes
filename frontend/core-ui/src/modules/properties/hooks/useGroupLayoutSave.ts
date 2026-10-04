import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IFieldGroup } from '../types/Properties';
import { useFieldGroupEdit } from './useFieldGroupEdit';

export const useGroupLayoutSave = (group: IFieldGroup, onSaved: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { editFieldGroup, loading } = useFieldGroupEdit();

  // Null drops the layout, so the group falls back to the default flow.
  const save = (layout: string[][] | null) => {
    const rest = { ...group.configs };

    delete rest.layout;

    editFieldGroup({
      variables: {
        id: group._id,
        configs: layout ? { ...rest, layout } : rest,
      },
      refetchQueries: ['FieldGroups'],
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
    });
  };

  return { save, loading };
};
