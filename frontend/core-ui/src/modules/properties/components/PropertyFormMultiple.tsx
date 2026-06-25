import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IPropertyForm } from '../types/Properties';
import { Form, Switch } from 'erxes-ui';

export const PropertyFormMultiple = ({
  form,
}: {
  form: UseFormReturn<IPropertyForm>;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const type = form.watch('type');

  if (!type || ['number', 'boolean'].includes(type)) {
    return null;
  }

  return (
    <Form.Field
      name="multiple"
      render={({ field }) => (
        <Form.Item>
          <div className="flex items-center gap-2">
            <Form.Control>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </Form.Control>
            <Form.Label variant="peer">{t('multiple', 'Multiple')}</Form.Label>
          </div>
        </Form.Item>
      )}
    />
  );
};
