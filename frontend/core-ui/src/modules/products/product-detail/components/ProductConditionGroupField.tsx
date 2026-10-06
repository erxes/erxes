import { Form, Label, Select } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';
import { useProductConditionGroups } from '@/products/settings/hooks/useProductConditionGroups';

// Select items cannot carry an empty value, so "no group" has its own key.
const NONE = '__none__';

export const ProductConditionGroupField = () => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const form = useFormContext<ProductFormValues>();
  const { conditionGroups, loading } = useProductConditionGroups();

  return (
    <Form.Field
      control={form.control}
      name="conditionGroupId"
      render={({ field }) => (
        <div className="space-y-2">
          <Label>{t('condition-group', 'Condition group')}</Label>
          <Select
            value={field.value || NONE}
            onValueChange={(value) =>
              field.onChange(value === NONE ? '' : value)
            }
            disabled={loading}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={NONE}>{t('none', 'None')}</Select.Item>
              {conditionGroups.map((group) => (
                <Select.Item key={group._id} value={group._id}>
                  {group.name}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      )}
    />
  );
};
