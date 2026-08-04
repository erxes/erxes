import { Form, Select } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IPropertyForm } from '../types/Properties';
import { CORE_RELATION_TYPES } from 'ui-modules';
import { useParams } from 'react-router-dom';

export const PropertySelectRelationType = ({
  form,
}: {
  form: UseFormReturn<IPropertyForm>;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const { id } = useParams<{ id: string }>();

  const type = form.watch('type');
  
  if (type !== 'relation') {
    return <></>;
  }

  return (
    <Form.Field
      name="relationType"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('relation-type', 'Relation Type')}</Form.Label>
          <Select value={field.value} onValueChange={field.onChange} disabled={Boolean(id)}>
            <Form.Control>
              <Select.Trigger>
                <Select.Value placeholder={t('select-relation-type', 'Select relation type')} />
              </Select.Trigger>
            </Form.Control>
            <Select.Content>
              {CORE_RELATION_TYPES.map((type) => (
                <Select.Item key={type.value} value={type.value}>
                  {t(`content-type.${type.value.replace(':', '-')}`, type.label)}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
