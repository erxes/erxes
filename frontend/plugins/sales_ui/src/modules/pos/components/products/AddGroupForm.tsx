import { useState, useEffect, useMemo, useCallback } from 'react';
import { Label } from 'erxes-ui';
import { SelectCategory, SelectProduct } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useProductFilterLabels } from '@/productFilters/useProductFilterLabels';
import { ProductTagSelect } from '@/productFilters/ProductTagSelect';
import { MoreOptionsButton } from '@/pos/components/MoreOptionsButton';
import { ProductGroup } from '@/pos/pos-detail/types/IPos';
import { nanoid } from 'nanoid';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const productGroupFormSchema = z.object({
  categoryIds: z.array(z.string().min(1)),
  productIds: z.array(z.string().min(1)),
  tagIds: z.array(z.string().min(1)),
  excludeTagIds: z.array(z.string().min(1)),
  excludedCategoryIds: z.array(z.string().min(1)),
  excludedProductIds: z.array(z.string().min(1)),
});
type FormState = z.infer<typeof productGroupFormSchema>;

const INITIAL_STATE: FormState = {
  categoryIds: [],
  productIds: [],
  tagIds: [],
  excludeTagIds: [],
  excludedCategoryIds: [],
  excludedProductIds: [],
};

interface AddGroupFormProps {
  onGroupAdded?: (group: ProductGroup) => void | Promise<void>;
  onGroupUpdated?: (group: ProductGroup) => void | Promise<void>;
  editingGroup?: ProductGroup | null;
  onDirtyChange?: (isDirty: boolean) => void;
  onSaveRequestChange?: (onSave: (() => Promise<void>) | null) => void;
}

export const AddGroupForm: React.FC<AddGroupFormProps> = ({
  onGroupAdded,
  onGroupUpdated,
  editingGroup,
  onDirtyChange,
  onSaveRequestChange,
}) => {
  const { t } = useTranslation('sales');
  const filterLabels = useProductFilterLabels();
  const {
    control,
    reset,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormState>({
    defaultValues: INITIAL_STATE,
    resolver: zodResolver(productGroupFormSchema),
  });
  const formState = useWatch({ control, defaultValue: INITIAL_STATE });
  const [initialState, setInitialState] = useState<FormState>(INITIAL_STATE);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const newState: FormState = editingGroup
      ? {
          categoryIds: editingGroup.categoryIds ?? [],
          productIds: editingGroup.productIds ?? [],
          tagIds: editingGroup.tagIds ?? [],
          excludeTagIds: editingGroup.excludeTagIds ?? [],
          excludedCategoryIds: editingGroup.excludedCategoryIds ?? [],
          excludedProductIds: editingGroup.excludedProductIds ?? [],
        }
      : INITIAL_STATE;

    reset(newState);
    setInitialState(newState);
  }, [editingGroup, reset]);

  const hasChanges = useMemo(
    () => JSON.stringify(formState) !== JSON.stringify(initialState),
    [formState, initialState],
  );

  const updateField = useCallback(
    (field: keyof FormState, value: string[]) => {
      setValue(field, value, { shouldDirty: true, shouldValidate: true });
    },
    [setValue],
  );

  const handleCategorySelect = useCallback(
    (value: string | string[]) => {
      updateField(
        'categoryIds',
        Array.isArray(value) ? value : value ? [value] : [],
      );
    },
    [updateField],
  );

  const handleExcludeCategorySelect = useCallback(
    (value: string | string[]) => {
      updateField(
        'excludedCategoryIds',
        Array.isArray(value) ? value : value ? [value] : [],
      );
    },
    [updateField],
  );

  const handleExcludeProductsChange = useCallback(
    (value: string | string[]) => {
      updateField(
        'excludedProductIds',
        Array.isArray(value) ? value : value ? [value] : [],
      );
    },
    [updateField],
  );

  const handleSave = useCallback(async () => {
    if (!(await trigger())) throw new Error(filterLabels.invalidSelection);
    const values = getValues();
    const groupData: ProductGroup = {
      _id: editingGroup?._id || `temporaryId${nanoid()}`,
      ...values,
    };

    await (editingGroup ? onGroupUpdated : onGroupAdded)?.(groupData);
    setInitialState(values);
  }, [
    editingGroup,
    trigger,
    getValues,
    filterLabels.invalidSelection,
    onGroupAdded,
    onGroupUpdated,
  ]);

  useEffect(() => {
    onDirtyChange?.(hasChanges);
    onSaveRequestChange?.(hasChanges ? handleSave : null);

    return () => {
      onDirtyChange?.(false);
      onSaveRequestChange?.(null);
    };
  }, [handleSave, hasChanges, onDirtyChange, onSaveRequestChange]);

  const toggleMore = useCallback(() => setShowMore((prev) => !prev), []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 items-end gap-x-4 gap-y-6">
        <div className="min-w-0 space-y-2">
          <Label>{t('PRODUCT-CATEGORY')}</Label>
          <SelectCategory
            mode="multiple"
            value={formState.categoryIds}
            onValueChange={handleCategorySelect}
            placeholder={t('select-product-categories')}
          />
        </div>
        {!showMore && (
          <div>
            <MoreOptionsButton showMore={showMore} onToggle={toggleMore} />
          </div>
        )}
        {showMore && (
          <>
            <div className="min-w-0 space-y-2">
              <Label>{t('EXCLUDE-PRODUCT-CATEGORY')}</Label>
              <SelectCategory
                mode="multiple"
                value={formState.excludedCategoryIds}
                onValueChange={handleExcludeCategorySelect}
                placeholder={t('select-product-categories-to-exclude')}
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label>{filterLabels.tags}</Label>
              <ProductTagSelect
                value={formState.tagIds || []}
                onValueChange={(value) => updateField('tagIds', value)}
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label>{filterLabels.excludeTags}</Label>
              <ProductTagSelect
                value={formState.excludeTagIds || []}
                onValueChange={(value) => updateField('excludeTagIds', value)}
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label>{filterLabels.products}</Label>
              <SelectProduct
                mode="multiple"
                value={formState.productIds}
                onValueChange={(value) =>
                  updateField(
                    'productIds',
                    Array.isArray(value) ? value : value ? [value] : [],
                  )
                }
              />
            </div>
            <div className="min-w-0 space-y-2">
              <Label>{t('exclude-products')}</Label>
              <SelectProduct
                mode="multiple"
                value={formState.excludedProductIds}
                onValueChange={handleExcludeProductsChange}
                placeholder={t('select-products-to-exclude')}
              />
            </div>
            <p className="col-span-2 text-sm text-muted-foreground">
              {filterLabels.description}
            </p>
            <div className="col-span-2">
              <MoreOptionsButton showMore={showMore} onToggle={toggleMore} />
            </div>
          </>
        )}
      </div>
      {Object.keys(errors).length > 0 && (
        <p className="text-sm text-destructive" role="alert">
          {filterLabels.invalidSelection}
        </p>
      )}
    </div>
  );
};
