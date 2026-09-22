import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PROPERTY_SYSTEM_FIELD_EDIT } from '../graphql/mutations/propertiesMutations';
import { PROPERTY_SYSTEM_FIELDS_QUERY } from '../graphql/queries/propertiesQueries';
import {
  IPropertySystemField,
  IPropertySystemFieldConfig,
} from '../types/Properties';

export const useEditPropertySystemField = (contentType: string) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const [mutate, { loading }] = useMutation<{
    propertySystemFieldEdit: IPropertySystemField;
  }>(PROPERTY_SYSTEM_FIELD_EDIT, {
    update: (cache, { data }) => {
      const edited = data?.propertySystemFieldEdit;

      if (!edited) {
        return;
      }

      cache.updateQuery<{ propertySystemFields: IPropertySystemField[] }>(
        { query: PROPERTY_SYSTEM_FIELDS_QUERY, variables: { contentType } },
        (current) =>
          current && {
            propertySystemFields: current.propertySystemFields.map((field) =>
              field.code === edited.code ? edited : field,
            ),
          },
      );
    },
    onError: (error) => {
      toast({
        title: t('error', 'Error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const editSystemField = (
    code: string,
    changes: Partial<IPropertySystemFieldConfig>,
  ) => mutate({ variables: { contentType, code, ...changes } });

  return { editSystemField, loading };
};
