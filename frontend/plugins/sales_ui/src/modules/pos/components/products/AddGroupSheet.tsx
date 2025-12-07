import type React from 'react';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Sheet, Input, Label, Textarea } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { SelectCategory, SelectProduct } from 'ui-modules';
import { ProductGroup } from '@/pos/pos-detail/types/IPos';

interface AddGroupFormData {
  groupName: string;
  groupDescription?: string;
}

interface AddGroupSheetProps {
  posId?: string;
  onGroupAdded?: (group: ProductGroup) => void;
  onGroupUpdated?: (group: ProductGroup) => void;
  editingGroup?: ProductGroup | null;
  onEditComplete?: () => void;
}

export const AddGroupSheet: React.FC<AddGroupSheetProps> = ({
  posId,
  onGroupAdded,
  onGroupUpdated,
  editingGroup,
  onEditComplete,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [excludedCategoryIds, setExcludedCategoryIds] = useState<string[]>([]);
  const [excludedProductIds, setExcludedProductIds] = useState<string[]>([]);

  const form = useForm<AddGroupFormData>({
    defaultValues: {
      groupName: '',
      groupDescription: '',
    },
  });

  useEffect(() => {
    if (editingGroup) {
      setOpen(true);
      form.reset({
        groupName: editingGroup.name || '',
        groupDescription: editingGroup.description || '',
      });
      setCategoryIds(editingGroup.categoryIds || []);
      setExcludedCategoryIds(editingGroup.excludedCategoryIds || []);
      setExcludedProductIds(editingGroup.excludedProductIds || []);
    }
  }, [editingGroup, form]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      form.reset();
      setCategoryIds([]);
      setExcludedCategoryIds([]);
      setExcludedProductIds([]);
      if (editingGroup) {
        onEditComplete?.();
      }
    }
  };

  const onSubmit = (data: AddGroupFormData) => {
    const groupData: ProductGroup = {
      _id:
        editingGroup?._id ||
        `temporaryId${Math.random().toString(36).substring(2, 11)}`,
      name: data.groupName,
      description: data.groupDescription,
      categoryIds,
      excludedCategoryIds,
      excludedProductIds,
    };

    if (editingGroup) {
      onGroupUpdated?.(groupData);
    } else {
      onGroupAdded?.(groupData);
    }

    handleOpenChange(false);
  };

  const onCancel = () => {
    handleOpenChange(false);
  };

  const isEditing = !!editingGroup;

  const handleCategorySelect = ((
    value: React.SyntheticEvent<HTMLButtonElement> | string,
  ) => {
    const categoryId =
      typeof value === 'string' ? value : value?.currentTarget?.value;

    if (categoryId) {
      setCategoryIds([categoryId]);
    }
  }) as React.ReactEventHandler<HTMLButtonElement> &
    ((categoryId: string) => void);

  const handleExcludeCategorySelect = ((
    value: React.SyntheticEvent<HTMLButtonElement> | string,
  ) => {
    const categoryId =
      typeof value === 'string' ? value : value?.currentTarget?.value;

    if (categoryId) {
      setExcludedCategoryIds([categoryId]);
    }
  }) as React.ReactEventHandler<HTMLButtonElement> &
    ((categoryId: string) => void);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {!isEditing && (
        <Sheet.Trigger asChild>
          <Button variant="outline">
            <IconPlus size={16} className="mr-2" />
            Add Group
          </Button>
        </Sheet.Trigger>
      )}
      <Sheet.View className="p-0 sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>{isEditing ? 'Edit group' : 'Add group'}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="groupName">
                GROUP NAME <span className="text-red-500">*</span>
              </Label>
              <Input
                id="groupName"
                {...form.register('groupName', { required: true })}
                placeholder="Enter group name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="groupDescription">GROUP DESCRIPTION</Label>
              <Textarea
                id="groupDescription"
                {...form.register('groupDescription')}
                placeholder="Enter group description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>PRODUCT CATEGORY</Label>
              <SelectCategory
                selected={categoryIds[0] || ''}
                onSelect={handleCategorySelect}
              />
            </div>

            <div className="space-y-2">
              <Label>EXCLUDE PRODUCT CATEGORY</Label>
              <SelectCategory
                selected={excludedCategoryIds[0] || ''}
                onSelect={handleExcludeCategorySelect}
              />
            </div>

            <div className="space-y-2">
              <Label>EXCLUDE PRODUCTS</Label>
              <SelectProduct
                mode="multiple"
                value={excludedProductIds}
                onValueChange={(value) =>
                  setExcludedProductIds(value as string[])
                }
                placeholder="Select products to exclude"
              />
            </div>
          </form>
        </Sheet.Content>

        <Sheet.Footer className="bg-background">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>
            {isEditing ? 'Update Group' : 'Add Group'}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
