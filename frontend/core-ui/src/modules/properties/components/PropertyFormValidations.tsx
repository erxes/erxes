import { Form, Switch } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IPropertyForm } from '../types/Properties';

// Only the formats the server actually enforces are offered.
const VALIDATIONS = [
  { name: 'number', label: 'Number', fallback: 'Must be a number' },
  { name: 'email', label: 'Email', fallback: 'Must be a valid email' },
  { name: 'date', label: 'Date', fallback: 'Must be a valid date' },
] as const;

export const PropertyFormValidation = ({
  form,
}: {
  form: UseFormReturn<IPropertyForm>;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const type = form.watch('type');

  if (type !== 'text' && type !== 'textarea') {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <Form.Label>{t('validation', 'Validation')}</Form.Label>

      {VALIDATIONS.map(({ name, label, fallback }) => (
        <Form.Field
          key={name}
          name={`validations.${name}`}
          render={({ field }) => (
            <Form.Item className="flex-auto flex flex-row items-center justify-between space-y-0">
              <Form.Label variant="peer">
                {t(`validation-${name}`, label)}
              </Form.Label>
              <Form.Control>
                <Switch
                  checked={!!field.value}
                  onCheckedChange={(checked) => {
                    // formats are exclusive; rules this form does not own stay
                    const next = { ...form.getValues('validations') };

                    for (const { name: key } of VALIDATIONS) {
                      delete next[key];
                    }

                    if (checked) {
                      next[name] = true;
                    }

                    form.setValue('validations', next);
                  }}
                />
              </Form.Control>
              <Form.Description className="sr-only">
                {t(`validation-${name}-description`, fallback)}
              </Form.Description>
            </Form.Item>
          )}
        />
      ))}
    </div>
  );
};
