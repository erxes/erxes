import { Button, Dialog, Label, Select } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCategoryConditions } from '@/products/product-category/hooks/useCategoryConditions';
import { ConditionModeToggle } from '@/products/settings/components/productsConfig/condition/ConditionModeToggle';
import { ProductConditionCodesMode } from '@/products/settings/components/productsConfig/condition/types';
import { useProductConditions } from '@/products/settings/hooks/useProductConditions';

// Touches the category's products once; later products are set on their own.
export const CategoryConditionsDialog = ({
  categoryId,
  categoryName,
  open,
  onOpenChange,
}: {
  categoryId: string;
  categoryName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('product');
  const [mode, setMode] = useState<ProductConditionCodesMode>('add');
  const [code, setCode] = useState('');
  const { conditions, loading } = useProductConditions();
  const { apply, loading: saving } = useCategoryConditions(() =>
    onOpenChange(false),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>
            {t('category-conditions', 'Conditions')} — {categoryName}
          </Dialog.Title>
          <Dialog.Description>
            {t(
              'category-conditions-description',
              'Every product in this category and its subcategories is changed now. Products added later are not changed.',
            )}
          </Dialog.Description>
        </Dialog.Header>
        <div className="space-y-4">
          <ConditionModeToggle value={mode} onChange={setMode} />
          <div className="space-y-2">
            <Label>{t('condition', 'Condition')}</Label>
            <Select value={code} onValueChange={setCode} disabled={loading}>
              <Select.Trigger>
                <Select.Value
                  placeholder={t('choose-condition', 'Choose a condition')}
                />
              </Select.Trigger>
              <Select.Content>
                {conditions.map((condition) => (
                  <Select.Item key={condition._id} value={condition.code}>
                    {condition.name} ({condition.code})
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </div>
        <Dialog.Footer>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            disabled={saving || !code}
            onClick={() => apply(categoryId, code, mode)}
          >
            {t('save', 'Save')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
