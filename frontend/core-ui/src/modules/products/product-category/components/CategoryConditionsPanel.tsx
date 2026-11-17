import { Button, Label, ScrollArea, Select, Sheet, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ProductEditorHeader,
  ProductEditorPanel,
} from '@/products/components/ProductEditorPanel';
import { useCategoryConditions } from '@/products/product-category/hooks/useCategoryConditions';
import { ConditionModeToggle } from '@/products/settings/components/productsConfig/condition/ConditionModeToggle';
import { ProductConditionCodesMode } from '@/products/settings/components/productsConfig/condition/types';
import { useProductConditions } from '@/products/settings/hooks/useProductConditions';

type TCategoryConditionsProps = {
  categoryId: string;
  categoryName: string;
};

const CategoryConditionsForm = ({
  categoryId,
  categoryName,
  onDone,
}: TCategoryConditionsProps & { onDone: () => void }) => {
  const { t } = useTranslation('product');
  const [mode, setMode] = useState<ProductConditionCodesMode>('add');
  const [code, setCode] = useState('');
  const { conditions, loading } = useProductConditions();
  const { apply, loading: saving } = useCategoryConditions(onDone);

  return (
    <div className="flex overflow-hidden flex-col h-full">
      <ProductEditorHeader
        title={`${t('category-conditions', 'Conditions')} — ${categoryName}`}
      />
      <Sheet.Content className="overflow-hidden flex-auto">
        <ScrollArea className="h-full">
          <div className="flex flex-col gap-4 p-5">
            <p className="text-sm text-muted-foreground">
              {t(
                'category-conditions-description',
                'Every product in this category and its subcategories is changed now. Products added later are not changed.',
              )}
            </p>
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
        </ScrollArea>
      </Sheet.Content>
      <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
        <Button type="button" variant="outline" onClick={onDone}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          type="button"
          disabled={saving || !code}
          onClick={() => apply(categoryId, code, mode)}
        >
          {saving && <Spinner size="sm" />}
          {t('save', 'Save')}
        </Button>
      </Sheet.Footer>
    </div>
  );
};

/**
 * Adds or removes a condition on every product of a category, beside the
 * category list. Touches the category's products once; later products are
 * set on their own.
 */
export const CategoryConditionsPanel = ({
  open,
  onOpenChange,
  ...props
}: TCategoryConditionsProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <ProductEditorPanel
    name={`categories/${props.categoryId}/conditions`}
    open={open}
    onOpenChange={onOpenChange}
    requiredPermission="productsUpdate"
  >
    <CategoryConditionsForm {...props} onDone={() => onOpenChange(false)} />
  </ProductEditorPanel>
);
