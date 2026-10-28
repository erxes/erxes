import { CoreModulePanel } from '@/side-panel/components/CoreModulePanel';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ScrollArea, Form, useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import {
  type ProductAttachmentItem,
  useFieldGroups,
  useFields,
} from 'ui-modules';
import {
  productFormSchema,
  ProductFormValues,
} from '@/products/product-category/add-category/components/formSchema';
import { CategoryAddSheetHeader } from '@/products/product-category/components/AddProductCategoryForm';
import { ProductCategoriesAddCoreFields } from '@/products/product-category/add-category/components/CategoryAddCoreFields';
import { ProductCategoryAddMoreFields } from '@/products/product-category/add-category/components/CategoryAddMoreFields';
import { useAddCategory } from '@/products/product-category/add-category/hooks/useAddCategory';
import { useTranslation } from 'react-i18next';

export function AddCategoryForm({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation('product', {
    keyPrefix: 'product-category',
  });
  const { productCategoriesAdd, loading: editLoading } = useAddCategory();
  const [attachment, setAttachment] = useState<ProductAttachmentItem | null>(
    null,
  );
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      code: '',
      parentId: '',
      description: '',
      maskType: '',
      attachment: null,
      status: '',
      meta: '',
      scopeBrandIds: [],
      isSimilarity: false,
      similarities: [],
    },
  });
  const { toast } = useToast();

  const { fieldGroups } = useFieldGroups({ contentType: 'core:product' });
  const { fields } = useFields({ contentType: 'core:product' });

  async function onSubmit(data: ProductFormValues) {
    const cleanData: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        cleanData[key] = value;
      }
    });

    productCategoriesAdd({
      variables: {
        ...cleanData,
        name: cleanData.name ?? '',
        code: cleanData.code ?? '',
        attachment: attachment || undefined,
        isSimilarity: cleanData.isSimilarity ?? false,
        similarities: cleanData.similarities?.length
          ? cleanData.similarities
          : undefined,
      },
      onError: (e: ApolloError) => {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('category-added'),
        });
        form.reset();
        setAttachment(null);
        onOpenChange(false);
      },
    });
  }

  const handleCancel = () => {
    form.reset();
    setAttachment(null);
    onOpenChange(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex overflow-hidden flex-col h-full"
      >
        <CategoryAddSheetHeader />
        <CoreModulePanel.Content className="overflow-hidden flex-auto">
          <ScrollArea className="h-full">
            <div className="p-5">
              <ProductCategoriesAddCoreFields form={form} />
              <ProductCategoryAddMoreFields
                form={form}
                attachment={attachment}
                onAttachmentChange={setAttachment}
                fieldGroups={fieldGroups}
                fields={fields}
              />
            </div>
          </ScrollArea>
        </CoreModulePanel.Content>

        <CoreModulePanel.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={handleCancel}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={editLoading}
          >
            {editLoading ? t('saving') : t('save')}
          </Button>
        </CoreModulePanel.Footer>
      </form>
    </Form>
  );
}
