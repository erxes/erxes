import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Sheet, Input, Label } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { CatProd } from '@/pos/pos-detail/types/IPos';
import { SelectCategory, SelectProduct } from 'ui-modules';

interface AddMappingFormData {
  categoryId: string;
  code: string;
  name: string;
  productId: string;
}

interface AddMappingSheetProps {
  posId?: string;
  onMappingAdded?: (mapping: CatProd) => void;
  onMappingUpdated?: (mapping: CatProd) => void;
  editingMapping?: CatProd | null;
  onEditComplete?: () => void;
}

export const AddMappingSheet: React.FC<AddMappingSheetProps> = ({
  posId,
  onMappingAdded,
  onMappingUpdated,
  editingMapping,
  onEditComplete,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const form = useForm<AddMappingFormData>({
    defaultValues: {
      categoryId: '',
      code: '',
      name: '',
      productId: '',
    },
  });

  useEffect(() => {
    if (editingMapping) {
      setOpen(true);
      form.reset({
        categoryId: editingMapping.categoryId || '',
        code: editingMapping.code || '',
        name: editingMapping.name || '',
        productId: editingMapping.productId || '',
      });
    }
  }, [editingMapping, form]);

  const onSubmit = (data: AddMappingFormData) => {
    const mappingData: CatProd = {
      _id:
        editingMapping?._id || `${Math.random().toString(36).substring(2, 11)}`,
      categoryId: data.categoryId,
      code: data.code,
      name: data.name,
      productId: data.productId,
    };

    if (editingMapping) {
      onMappingUpdated?.(mappingData);
    } else {
      onMappingAdded?.(mappingData);
    }

    setOpen(false);
    form.reset();
    onEditComplete?.();
  };

  const onCancel = () => {
    setOpen(false);
    form.reset();
    onEditComplete?.();
  };

  const isEditing = !!editingMapping;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!isEditing && (
        <Sheet.Trigger asChild>
          <Button variant="outline">
            <IconPlus size={16} className="mr-2" />
            Add Mapping
          </Button>
        </Sheet.Trigger>
      )}
      <Sheet.View className="p-0 sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>
            {isEditing ? 'Edit mapping' : 'Add mapping'}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="categoryId">
                PRODUCT CATEGORY <span className="text-red-500">*</span>
              </Label>
              <SelectCategory
                selected={form.watch('categoryId')}
                onSelect={
                  ((categoryId: string) =>
                    form.setValue(
                      'categoryId',
                      categoryId,
                    )) as unknown as React.ReactEventHandler<HTMLButtonElement> &
                    ((categoryId: string) => void)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">PRODUCT CODE CONTAINS</Label>
              <Input
                id="code"
                {...form.register('code')}
                placeholder="Enter product code pattern"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">PRODUCT NAME CONTAINS</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter product name pattern"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="productId">PACKAGING PRODUCTS</Label>
              <SelectProduct
                value={form.watch('productId')}
                onValueChange={(productId: string | string[]) => {
                  const id = Array.isArray(productId)
                    ? productId[0]
                    : productId;
                  form.setValue('productId', id || '');
                }}
                mode="single"
              />
            </div>
          </form>
        </Sheet.Content>

        <Sheet.Footer className="bg-background">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>
            {isEditing ? 'Update Mapping' : 'Add Mapping'}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
