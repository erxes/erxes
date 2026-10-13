import { Form, Label, MultipleSelector, MultiSelectOption } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';
import { useProductConditions } from '@/products/settings/hooks/useProductConditions';

export const ProductConditionsField = () => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const form = useFormContext<ProductFormValues>();
  const { conditions } = useProductConditions();

  const options: MultiSelectOption[] = conditions.map(({ code, name }) => ({
    value: code,
    label: name,
  }));
  const nameByCode = new Map(options.map(({ value, label }) => [value, label]));

  return (
    <Form.Field
      control={form.control}
      name="conditionCodes"
      render={({ field }) => (
        <div className="space-y-2">
          <Label>{t('conditions', 'Conditions')}</Label>
          <MultipleSelector
            options={options}
            // A code whose condition was removed still shows, so it is not lost silently.
            value={(field.value || []).map((code) => ({
              value: code,
              label: nameByCode.get(code) || code,
            }))}
            onChange={(selected) =>
              field.onChange(selected.map(({ value }) => value))
            }
            hidePlaceholderWhenSelected
          />
        </div>
      )}
    />
  );
};
