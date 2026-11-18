import { IconFolder, IconPackage } from '@tabler/icons-react';
import { Form } from 'erxes-ui';
import {
  PosFieldList,
  PosFieldRow,
} from '@/pos/components/pos-edit/PosFieldRow';
import { useTranslation } from 'react-i18next';
import { type Control } from 'react-hook-form';
import { SelectCategory, SelectProduct } from 'ui-modules';
import { type ProductsFormData } from '@/pos/components/products/Products';
import { toIds } from '@/pos/utils/toIds';

interface KioskExcludeProductsProps {
  control: Control<ProductsFormData>;
}

export const KioskExcludeProducts: React.FC<KioskExcludeProductsProps> = ({
  control,
}) => {
  const { t } = useTranslation('sales');
  return (
    <PosFieldList>
      <Form.Field
        control={control}
        name="kioskExcludeCategoryIds"
        render={({ field }) => (
          <PosFieldRow label={t('exclude-categories')} icon={IconFolder}>
            <SelectCategory
              mode="multiple"
              value={field.value}
              onValueChange={field.onChange}
              placeholder={t('select-categories-to-exclude')}
            />
          </PosFieldRow>
        )}
      />

      <Form.Field
        control={control}
        name="kioskExcludeProductIds"
        render={({ field }) => (
          <PosFieldRow label={t('exclude-products')} icon={IconPackage}>
            <SelectProduct
              value={field.value}
              onValueChange={(value) => field.onChange(toIds(value))}
              mode="multiple"
              placeholder={t('select-products-to-exclude')}
            />
          </PosFieldRow>
        )}
      />
    </PosFieldList>
  );
};
