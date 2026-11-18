import { IconFolder } from '@tabler/icons-react';
import { Form } from 'erxes-ui';
import { PosFieldRow } from '@/pos/components/pos-edit/PosFieldRow';
import { useTranslation } from 'react-i18next';
import { type Control } from 'react-hook-form';
import { type ProductsFormData } from '@/pos/components/products/Products';
import { SelectCategory } from 'ui-modules/modules';

interface InitialProductCategoriesProps {
  control: Control<ProductsFormData>;
}

export const InitialProductCategories: React.FC<
  InitialProductCategoriesProps
> = ({ control }) => {
  const { t } = useTranslation('sales');
  return (
    <Form.Field
      control={control}
      name="initialCategoryIds"
      render={({ field }) => (
        <PosFieldRow label={t('product-categories')} icon={IconFolder} required>
          <SelectCategory
            mode="multiple"
            value={field.value}
            onValueChange={field.onChange}
            placeholder={t('select-initial-product-categories')}
          />
        </PosFieldRow>
      )}
    />
  );
};
