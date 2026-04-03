import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button, Label } from 'erxes-ui';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { SelectProduct } from 'ui-modules';
import { SelectCategory } from '@/pos/hooks/SelectCategory';
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
  onGroupAdded?: (group: ProductGroup) => void;
  onGroupUpdated?: (group: ProductGroup) => void;
  editingGroup?: ProductGroup | null;
}

export const AddGroupForm: React.FC<AddGroupFormProps> = ({
  onGroupAdded,
  onGroupUpdated,
  editingGroup,
}) => {
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

  const handleSave = useCallback(() => {
    const groupData: ProductGroup = {
      _id: editingGroup?._id || `temporaryId${nanoid()}`,
      ...formState,
    };

    (editingGroup ? onGroupUpdated : onGroupAdded)?.(groupData);
    setInitialState(formState);
  }, [editingGroup, formState, onGroupAdded, onGroupUpdated]);

  const toggleMore = useCallback(() => setShowMore((prev) => !prev), []);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>PRODUCT CATEGORY</Label>
        <SelectCategory
          mode="multiple"
          value={formState.categoryIds}
          onValueChange={handleCategorySelect}
          placeholder="Select product categories"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={toggleMore}
        className="flex gap-1 items-center text-muted-foreground"
      >
        {showMore ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        {showMore ? 'Hide more options' : 'More options'}
      </Button>

      {showMore && (
        <>
          <div className="space-y-2">
            <Label>EXCLUDE PRODUCT CATEGORY</Label>
            <SelectCategory
              mode="multiple"
              value={formState.excludedCategoryIds}
              onValueChange={handleExcludeCategorySelect}
              placeholder="Select product categories to exclude"
            />
          </div>

          <div className="space-y-2">
            <Label>EXCLUDE PRODUCTS</Label>
            <SelectProduct
              mode="multiple"
              value={formState.excludedProductIds}
              onValueChange={handleExcludeProductsChange}
              placeholder="Select products to exclude"
            />
          </div>
        </>
      )}

      {hasChanges && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      )}
    </div>
  );
};
