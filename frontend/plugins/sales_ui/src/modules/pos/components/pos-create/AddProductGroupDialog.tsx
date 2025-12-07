import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Dialog, Input, Label, Textarea } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { SelectCategory, SelectProduct } from 'ui-modules';
import { ProductGroup } from '@/pos/pos-detail/types/IPos';

interface AddGroupFormData {
  groupName: string;
  groupDescription?: string;
}

interface AddProductGroupDialogProps {
  onGroupAdded?: (group: ProductGroup) => void;
  onGroupUpdated?: (group: ProductGroup) => void;
  editingGroup?: ProductGroup | null;
  onEditComplete?: () => void;
}

export const AddProductGroupDialog: React.FC<AddProductGroupDialogProps> = ({
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

    setOpen(false);
    form.reset();
    setCategoryIds([]);
    setExcludedCategoryIds([]);
    setExcludedProductIds([]);
    onEditComplete?.();
  };

  const onCancel = () => {
    setOpen(false);
    form.reset();
    setCategoryIds([]);
    setExcludedCategoryIds([]);
    setExcludedProductIds([]);
    onEditComplete?.();
  };

  const isEditing = !!editingGroup;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isEditing && (
        <Dialog.Trigger asChild>
          <Button type="button" variant="outline" size="lg" className="w-full">
            <IconPlus size={16} className="mr-2" />
            Add Product Group
          </Button>
        </Dialog.Trigger>
      )}
      <Dialog.Content className="sm:max-w-lg">
        <Dialog.Header>
          <Dialog.Title>
            {isEditing ? 'Edit Product Group' : 'Add Product Group'}
          </Dialog.Title>
        </Dialog.Header>

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
              onSelect={
                ((categoryId: string) =>
                  setCategoryIds([
                    categoryId,
                  ])) as unknown as React.ReactEventHandler<HTMLButtonElement> &
                  ((categoryId: string) => void)
              }
            />
          </div>

          <div className="space-y-2">
            <Label>EXCLUDE PRODUCT CATEGORY</Label>
            <SelectCategory
              selected={excludedCategoryIds[0] || ''}
              onSelect={
                ((categoryId: string) =>
                  setExcludedCategoryIds([
                    categoryId,
                  ])) as unknown as React.ReactEventHandler<HTMLButtonElement> &
                  ((categoryId: string) => void)
              }
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

          <Dialog.Footer>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="button" onClick={form.handleSubmit(onSubmit)}>
              {isEditing ? 'Update Group' : 'Add Group'}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
