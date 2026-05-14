import { CurrencyCode, CurrencyField, Form, InfoCard, Label } from 'erxes-ui';
import { SelectBrand } from 'ui-modules/modules/brands';
import { SelectCompany } from 'ui-modules/modules/contacts';
import { useTranslation } from 'react-i18next';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';
import { useFormContext } from 'react-hook-form';

export function ProductDetailInfo() {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const form = useFormContext<ProductFormValues>();

  return (
    <InfoCard title={t('more-info')}>
      <InfoCard.Content>
        <div className="grid grid-cols-3 gap-4">
          <Form.Field
            control={form.control}
            name="scopeBrandIds"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>{t('brand')}</Label>
                <SelectBrand
                  value={field.value || []}
                  onValueChange={field.onChange}
                  mode="multiple"
                />
              </div>
            )}
          />
          <Form.Field
            control={form.control}
            name="vendorId"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>{t('vendor')}</Label>
                <SelectCompany
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </div>
            )}
          />
          <Form.Field
            control={form.control}
            name="currency"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>{t('currency')}</Label>
                <CurrencyField.SelectCurrency
                  value={(field.value as CurrencyCode) ?? undefined}
                  onChange={field.onChange}
                  className="w-full"
                />
              </div>
            )}
          />
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
}
