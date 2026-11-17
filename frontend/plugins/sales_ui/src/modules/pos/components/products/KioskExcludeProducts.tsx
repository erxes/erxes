import { Form } from 'erxes-ui';
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Form.Field
        control={control}
        name="kioskExcludeCategoryIds"
        render={({ field }) => (
          <Form.Item className="min-w-0">
            <Form.Label variant="peer" className="text-sm font-medium">
              {t('exclude-categories')}
            </Form.Label>
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
          <Form.Item className="min-w-0">
            <Form.Label variant="peer" className="text-sm font-medium">
              {t('exclude-products')}
            </Form.Label>
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
                placeholder={t('select-products-to-exclude')}
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    </div>
  );
};
