import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IPropertyForm } from '../types/Properties';
import { Form, Input, Select } from 'erxes-ui';

export const PropertyFormValidation = ({
  form,
}: {
  form: UseFormReturn<IPropertyForm>;
}) => {
  const type = form.watch('type');

  if (type === 'text') {
    return <PropertyFormStringValidation />;
  }
  return <></>;
};

export const PropertyFormStringValidation = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  return (
    <Form.Field
      name="validation"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('validation', 'Validation')}</Form.Label>

          <Select {...field} onValueChange={field.onChange}>
            <Form.Control>
              <Select.Trigger>
                <Select.Value placeholder={t('select-validation', 'Select validation')} />
              </Select.Trigger>
            </Form.Control>
            <Select.Content>
              <Select.Item value="text">{t('validation-text', 'Text')}</Select.Item>
              <Select.Item value="number">{t('validation-number', 'Number')}</Select.Item>
              <Select.Item value="url">{t('validation-url', 'URL')}</Select.Item>
              <Select.Item value="phone">{t('validation-phone', 'Phone')}</Select.Item>
              <Select.Item value="email">{t('validation-email', 'Email')}</Select.Item>
              <Select.Item value="password">{t('validation-password', 'Password')}</Select.Item>
            </Select.Content>
          </Select>
        </Form.Item>
      )}
    />
  );
};
