import {
  Command,
  Combobox,
  Form,
  Label,
  MultipleSelector,
  MultiSelectOption,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { IconListCheck } from '@tabler/icons-react';
import { useState } from 'react';
import { PanelField, PanelFieldTrigger } from 'ui-modules';
import { ProductPanelPlaceholder } from './ProductPanelField';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';
import { useProductConditions } from '@/products/settings/hooks/useProductConditions';

export const ProductConditionsField = ({
  compact = false,
}: {
  compact?: boolean;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const form = useFormContext<ProductFormValues>();
  const { conditions, loading, error } = useProductConditions();
  const [open, setOpen] = useState(false);

  const options: MultiSelectOption[] = conditions.map(({ code, name }) => ({
    value: code,
    label: name,
  }));
  const nameByCode = new Map(options.map(({ value, label }) => [value, label]));

  if (compact) {
    return (
      <Form.Field
        control={form.control}
        name="conditionCodes"
        render={({ field }) => {
          const selected = field.value || [];
          const items = [
            ...options,
            ...selected
              .filter((code) => !nameByCode.has(code))
              .map((code) => ({ value: code, label: code })),
          ];
          const label = t('conditions', 'Conditions');
          return (
            <Form.Item className="space-y-0">
              <PanelField icon={IconListCheck} label={label}>
                <PopoverScoped
                  scope="product-panel.conditions"
                  open={open}
                  onOpenChange={setOpen}
                >
                  <Form.Control>
                    <PanelFieldTrigger aria-label={label}>
                      {selected.length ? (
                        <span className="truncate">
                          {selected
                            .map((code) => nameByCode.get(code) || code)
                            .join(', ')}
                        </span>
                      ) : (
                        <ProductPanelPlaceholder icon={IconListCheck}>
                          {label}
                        </ProductPanelPlaceholder>
                      )}
                    </PanelFieldTrigger>
                  </Form.Control>
                  <RecordTableInlineCell.Content>
                    <Command>
                      <Command.Input
                        placeholder={t(
                          'search-conditions',
                          'Search conditions',
                        )}
                      />
                      <Command.List>
                        <Combobox.Empty loading={loading} error={error} />
                        {items.map((option) => (
                          <Command.Item
                            key={option.value}
                            value={`${option.value} ${option.label}`}
                            onSelect={() =>
                              field.onChange(
                                selected.includes(option.value)
                                  ? selected.filter(
                                      (code) => code !== option.value,
                                    )
                                  : [...selected, option.value],
                              )
                            }
                          >
                            {option.label}
                            <Combobox.Check
                              checked={selected.includes(option.value)}
                            />
                          </Command.Item>
                        ))}
                      </Command.List>
                    </Command>
                  </RecordTableInlineCell.Content>
                </PopoverScoped>
              </PanelField>
              <Form.Message className="pl-[7rem] text-xs" />
            </Form.Item>
          );
        }}
      />
    );
  }

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
