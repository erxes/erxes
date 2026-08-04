import { useState, useEffect, useMemo, useCallback } from 'react';
import { Label } from 'erxes-ui';
import { SelectCategory, SelectProduct } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { MoreOptionsButton } from '@/pos/components/MoreOptionsButton';
import { ProductGroup } from '@/pos/pos-detail/types/IPos';
import { nanoid } from 'nanoid';

interface FormState {
  categoryIds: string[];
  excludedCategoryIds: string[];
  excludedProductIds: string[];
}

const INITIAL_STATE: FormState = {
  categoryIds: [],
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
  const [formState, setFormState] = useState<FormState>(INITIAL_STATE);
  const [initialState, setInitialState] = useState<FormState>(INITIAL_STATE);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const newState: FormState = editingGroup
      ? {
          categoryIds: editingGroup.categoryIds ?? [],
          excludedCategoryIds: editingGroup.excludedCategoryIds ?? [],
          excludedProductIds: editingGroup.excludedProductIds ?? [],
        }
      : INITIAL_STATE;

    setFormState(newState);
    setInitialState(newState);
  }, [editingGroup]);

  const hasChanges = useMemo(
    () => JSON.stringify(formState) !== JSON.stringify(initialState),
    [formState, initialState],
  );

  const updateField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleCategorySelect = useCallback(
    (value: string | string[]) => {
      updateField(
        'categoryIds',
        (Array.isArray(value) ? value : value ? [value] : []) as string[],
      );
    },
    [updateField],
  );

  const handleExcludeCategorySelect = useCallback(
    (value: string | string[]) => {
      updateField(
        'excludedCategoryIds',
        (Array.isArray(value) ? value : value ? [value] : []) as string[],
      );
    },
    [updateField],
  );

  const handleExcludeProductsChange = useCallback(
    (value: string | string[]) => {
      updateField('excludedProductIds', value as string[]);
    },
    [updateField],
  );

  const handleSave = useCallback(async () => {
    const groupData: ProductGroup = {
      _id: editingGroup?._id || `temporaryId${nanoid()}`,
      ...formState,
    };

    await (editingGroup ? onGroupUpdated : onGroupAdded)?.(groupData);
    setInitialState(formState);
  }, [editingGroup, formState, onGroupAdded, onGroupUpdated]);

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
      <div className="space-y-2">
        <Label>{t('PRODUCT-CATEGORY')}</Label>
        <SelectCategory
          mode="multiple"
          value={formState.categoryIds}
          onValueChange={handleCategorySelect}
          placeholder={t('select-product-categories')}
        />
      </div>

      <MoreOptionsButton showMore={showMore} onToggle={toggleMore} />

      {showMore && (
        <>
          <div className="space-y-2">
            <Label>{t('EXCLUDE-PRODUCT-CATEGORY')}</Label>
            <SelectCategory
              mode="multiple"
              value={formState.excludedCategoryIds}
              onValueChange={handleExcludeCategorySelect}
              placeholder={t('select-product-categories-to-exclude')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('exclude-products')}</Label>
            <SelectProduct
              mode="multiple"
              value={formState.excludedProductIds}
              onValueChange={handleExcludeProductsChange}
              placeholder={t('select-products-to-exclude')}
            />
          </div>
        </>
      )}
    </div>
  );
};
