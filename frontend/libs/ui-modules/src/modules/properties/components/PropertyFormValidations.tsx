import { Form, ToggleGroup } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IPropertyForm } from '../types/propertyFormTypes';

// Only the formats the server actually enforces are offered.
const VALIDATIONS = [
  { name: 'number', label: 'Number' },
  { name: 'email', label: 'Email' },
  { name: 'date', label: 'Date' },
] as const;

const NONE = 'none';

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
    <Form.Field
      control={form.control}
      name="validations"
      render={({ field }) => {
        const current =
          VALIDATIONS.find(({ name }) => field.value?.[name])?.name ?? NONE;

        return (
          <Form.Item className="flex flex-col gap-3">
            <Form.Label>{t('validation', 'Validation')}</Form.Label>
            <Form.Control>
              <ToggleGroup
                type="single"
                variant="outline"
                value={current}
                onValueChange={(next) => {
                  if (!next) {
                    return;
                  }

                  // Formats are exclusive; rules this form does not own stay.
                  const rest = { ...field.value };

                  for (const { name } of VALIDATIONS) {
                    delete rest[name];
                  }

                  field.onChange(
                    next === NONE ? rest : { ...rest, [next]: true },
                  );
                }}
                className="w-full"
              >
                <ToggleGroup.Item value={NONE} className="flex-1">
                  {t('validation-none', 'None')}
                </ToggleGroup.Item>
                {VALIDATIONS.map(({ name, label }) => (
                  <ToggleGroup.Item key={name} value={name} className="flex-1">
                    {t(`validation-${name}`, label)}
                  </ToggleGroup.Item>
                ))}
              </ToggleGroup>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        );
      }}
    />
  );
};
