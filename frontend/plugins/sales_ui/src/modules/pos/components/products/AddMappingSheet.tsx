import { CatProd } from '@/pos/pos-detail/types/IPos';
import { IconPlus } from '@tabler/icons-react';
import { Button, Input, Label, Sheet } from 'erxes-ui';
import { nanoid } from 'nanoid';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectCategory, SelectProduct } from 'ui-modules';

interface AddMappingFormData {
  categoryId: string;
  code: string;
  name: string;
  productId: string;
}

interface AddMappingSheetProps {
  onMappingAdded?: (mapping: CatProd) => void;
  onMappingUpdated?: (mapping: CatProd) => void;
  editingMapping?: CatProd | null;
  onEditComplete?: () => void;
}

export const AddMappingSheet: React.FC<AddMappingSheetProps> = ({
  onMappingAdded,
  onMappingUpdated,
  editingMapping,
  onEditComplete,
}) => {
  const { t } = useTranslation('sales');
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

  const generateId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return nanoid();
  };

  const onSubmit = (data: AddMappingFormData) => {
    const mappingData: CatProd = {
      _id: editingMapping?._id || generateId(),
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

  const handleCategorySelect: React.ReactEventHandler<HTMLButtonElement> &
    ((categoryId: string) => void) = (value) => {
    const categoryId =
      typeof value === 'string' ? value : value?.currentTarget?.value;

    if (categoryId) {
      form.setValue('categoryId', categoryId);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {!isEditing && (
        <Sheet.Trigger asChild>
          <Button variant="outline">
            <IconPlus size={16} className="mr-2" />
            {t('add-mapping')}
          </Button>
        </Sheet.Trigger>
      )}
      <Sheet.View className="p-0 sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>
            {isEditing ? t('edit-mapping') : t('add-mapping')}
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="categoryId">{t('PRODUCT-CATEGORY')}</Label>
              <SelectCategory
                selected={form.watch('categoryId')}
                onSelect={handleCategorySelect}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">{t('product-code-contains')}</Label>
              <Input
                id="code"
                {...form.register('code')}
                placeholder={t('enter-product-code-pattern')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">
                {t('product-name-contains')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...form.register('name', {
                  required: t('product-name-required'),
                })}
                placeholder={t('enter-product-name-pattern')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="productId">{t('packaging-products')}</Label>
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
            {t('cancel')}
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>
            {isEditing ? t('update-mapping') : t('add-mapping')}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
