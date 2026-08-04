import { Form, Label } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { type Control } from 'react-hook-form';
import { SelectCategory, SelectProduct } from 'ui-modules';
import { type ProductsFormData } from '@/pos/components/products/Products';

interface KioskExcludeProductsProps {
  control: Control<ProductsFormData>;
}

export const KioskExcludeProducts: React.FC<KioskExcludeProductsProps> = ({
  control,
}) => {
  const { t } = useTranslation('sales');
  return (
    <div className="space-y-4">
      <Form.Field
        control={control}
        name="kioskExcludeCategoryIds"
        render={({ field }) => (
          <Form.Item>
            <Label>{t('category')}</Label>

            <Form.Control>
              <SelectCategory
                mode="multiple"
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t('select-categories-to-exclude')}
              />
            </Form.Control>
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="kioskExcludeProductIds"
        render={({ field }) => (
          <Form.Item>
            <Label>{t('products')}</Label>

            <Form.Control>
              <SelectProduct
                value={field.value}
                onValueChange={(value) => {
                  const ids = Array.isArray(value)
                    ? value
                    : value
                      ? [value]
                      : [];
                  field.onChange(ids);
                }}
                mode="multiple"
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    </div>
  );
};
