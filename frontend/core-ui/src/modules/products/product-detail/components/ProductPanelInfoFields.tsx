import { ProductFormValues } from '@/products/constants/ProductFormSchema';
import {
  IconBuilding,
  IconCurrencyDollar,
  IconLabel,
} from '@tabler/icons-react';
import {
  CurrencyCode,
  CurrencyField,
  Form,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ContactsRelationField,
  PanelField,
  PanelFieldTrigger,
  SelectBrand,
} from 'ui-modules';
import { ProductConditionsField } from './ProductConditionsField';
import { ProductPanelPlaceholder } from './ProductPanelField';

export const ProductPanelInfoFields = () => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const form = useFormContext<ProductFormValues>();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <Form.Field
        control={form.control}
        name="scopeBrandIds"
        render={({ field }) => (
          <Form.Item className="space-y-0">
            <PanelField icon={IconLabel} label={t('brand')}>
              <SelectBrand.Provider
                value={field.value || []}
                onValueChange={field.onChange}
                mode="multiple"
              >
                <PopoverScoped
                  scope="product-panel.brands"
                  open={brandOpen}
                  onOpenChange={setBrandOpen}
                >
                  <Form.Control>
                    <PanelFieldTrigger aria-label={t('brand')}>
                      {field.value?.length ? (
                        <SelectBrand.Value />
                      ) : (
                        <ProductPanelPlaceholder icon={IconLabel}>
                          {t('brand')}
                        </ProductPanelPlaceholder>
                      )}
                    </PanelFieldTrigger>
                  </Form.Control>
                  <RecordTableInlineCell.Content>
                    <SelectBrand.Content />
                  </RecordTableInlineCell.Content>
                </PopoverScoped>
              </SelectBrand.Provider>
            </PanelField>
            <Form.Message className="pl-[7rem] text-xs" />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="vendorId"
        render={({ field }) => (
          <Form.Item className="space-y-0">
            <PanelField icon={IconBuilding} label={t('vendor')}>
              <ContactsRelationField
                kind="company"
                value={field.value}
                scope="product-panel.vendor"
                onValueChange={(value) => field.onChange(value || '')}
              />
            </PanelField>
            <Form.Message className="pl-[7rem] text-xs" />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="currency"
        render={({ field }) => (
          <Form.Item className="space-y-0">
            <PanelField icon={IconCurrencyDollar} label={t('currency')}>
              <PopoverScoped
                scope="product-panel.currency"
                open={currencyOpen}
                onOpenChange={setCurrencyOpen}
              >
                <Form.Control>
                  <PanelFieldTrigger aria-label={t('currency')}>
                    {field.value || (
                      <ProductPanelPlaceholder icon={IconCurrencyDollar}>
                        {t('currency')}
                      </ProductPanelPlaceholder>
                    )}
                  </PanelFieldTrigger>
                </Form.Control>
                <RecordTableInlineCell.Content>
                  <CurrencyField.SelectCurrencyCommand
                    value={field.value as CurrencyCode}
                    onSelect={(value) => {
                      field.onChange(value);
                      setCurrencyOpen(false);
                    }}
                  />
                </RecordTableInlineCell.Content>
              </PopoverScoped>
            </PanelField>
            <Form.Message className="pl-[7rem] text-xs" />
          </Form.Item>
        )}
      />
      <ProductConditionsField compact />
    </div>
  );
};
