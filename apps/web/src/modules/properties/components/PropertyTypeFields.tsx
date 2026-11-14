import type { FieldType, FieldUsage } from '@erxes/core-contract';
import { Form, Select, ToggleGroup } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FIELD_TYPES, hasOptions } from '../fieldTypes';
import type { PropertyFormApi } from './propertyFormApi';

/** Says why only similar types are offered. */
const PropertyTypeUsageHint = ({ usage, failed }: { usage?: FieldUsage; failed: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  if (failed) {
    return (
      <p className="text-sm text-muted-foreground">
        {t(
          'type-limited-unknown',
          'Could not check its records, so only types with the same stored value are offered.',
        )}
      </p>
    );
  }

  if (!usage || usage.records === 0) return null;

  return (
    <p className="text-sm text-muted-foreground">
      {t(
        'type-limited-values',
        '{{total}} records hold a value, so only types with the same stored value are offered.',
        { count: usage.records, total: usage.records },
      )}
    </p>
  );
};

/** The field's type; changing it drops options and validation the new type doesn't take. */
export const PropertyTypeField = ({
  form,
  allowedTypes,
  hint,
}: {
  form: PropertyFormApi;
  allowedTypes: FieldType[];
  /** Shown when editing: why the types are limited. */
  hint?: { usage?: FieldUsage; failed: boolean };
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  return (
    <Form.Field
      control={form.control}
      name="type"
      render={({ field }) => (
        <Form.Item className="flex-auto">
          <Form.Label>{t('type', 'Type')}</Form.Label>
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);

              if (!hasOptions(value)) form.setValue('options', []);

              if (value !== 'text' && value !== 'textarea') form.setValue('validation', null);
            }}
            disabled={allowedTypes.length < 2}
          >
            <Form.Control>
              <Select.Trigger>
                <Select.Value placeholder={t('select-type', 'Select type')} />
              </Select.Trigger>
            </Form.Control>
            <Select.Content>
              {FIELD_TYPES.filter(({ value }) => allowedTypes.includes(value)).map((type) => (
                <Select.Item key={type.value} value={type.value}>
                  <div className="flex items-center gap-2 [&_svg]:size-4">
                    <type.icon />
                    {t(`field-type.${type.i18nKey}`, type.label)}
                  </div>
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          {hint && <PropertyTypeUsageHint usage={hint.usage} failed={hint.failed} />}
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

// Only the formats the server enforces are offered.
const VALIDATIONS = [
  { name: 'number', label: 'Number' },
  { name: 'email', label: 'Email' },
  { name: 'date', label: 'Date' },
] as const;

const NONE = 'none';

/** A text field's format check (none, number, email or date). */
export const PropertyValidationField = ({ form }: { form: PropertyFormApi }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const type = useWatch({ control: form.control, name: 'type' });

  if (type !== 'text' && type !== 'textarea') return null;

  return (
    <Form.Field
      control={form.control}
      name="validation"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('validation', 'Validation')}</Form.Label>
          <Form.Control>
            <ToggleGroup
              variant="outline"
              value={[field.value ?? NONE]}
              onValueChange={([next]) => {
                if (!next) return;
                field.onChange(next === NONE ? null : next);
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
      )}
    />
  );
};
