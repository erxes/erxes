import {
  ProductEditorPanel,
  ProductEditorHeader,
} from '@/products/components/ProductEditorPanel';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2 } from '@tabler/icons-react';
import {
  Button,
  Sheet,
  ScrollArea,
  Form,
  useToast,
  useSetHotkeyScope,
  useQueryState,
} from 'erxes-ui';
import {
  type ProductAttachmentItem,
  toProductAttachmentItem,
} from 'ui-modules';
import { CategoryHotKeyScope } from '../../types/CategoryHotKeyScope';
import { CategoriesUpdateCoreFields } from './CategoryUpdateCoreFields';
import { useProductCategoriesEdit } from '../hooks/useUpdateCategory';
import {
  productFormSchema,
  ProductFormValues,
} from '../../add-category/components/formSchema';
import { CategoryUpdateMoreFields } from './CategoryUpdateMoreFields';
import { useProductCategoryDetail } from '../hooks/useCategoryDetail';
import { useTranslation } from 'react-i18next';

export const CategoryDetailSheet = () => {
  const { t } = useTranslation('product', {
    keyPrefix: 'product-category',
  });
  const setHotkeyScope = useSetHotkeyScope();
  const [categoryId, setCategoryId] = useQueryState<string>('category_id');
  const selection = useMemo(() => ({ categoryId }), [categoryId]);
  const currentSelection = useRef<typeof selection | null>(selection);
  useLayoutEffect(() => {
    currentSelection.current = selection;
    return () => {
      currentSelection.current = null;
    };
  }, [selection]);
  const [attachment, setAttachment] = useState<ProductAttachmentItem | null>(
    null,
  );

  const { toast } = useToast();
  const { productCategoriesEdit, loading: editLoading } =
    useProductCategoriesEdit();

  const { categoryDetail, loading, error } = useProductCategoryDetail();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      code: '',
      parentId: '',
      description: '',
      attachment: null,
      maskType: '',
      status: '',
      meta: '',
      scopeBrandIds: [],
      isSimilarity: false,
      similarities: [],
    },
  });

  useEffect(() => {
    if (categoryId) {
      setHotkeyScope(CategoryHotKeyScope.CategoryEditSheet);
    }
  }, [categoryId, setHotkeyScope]);

  useEffect(() => {
    setAttachment(toProductAttachmentItem(categoryDetail?.attachment));
  }, [categoryDetail?._id, categoryDetail?.attachment?.url]);

  const setOpen = (newCategoryId: string | null) => {
    setCategoryId(newCategoryId);

    if (!newCategoryId) {
      setHotkeyScope(CategoryHotKeyScope.CategoriesPage);
    }
  };

  async function onSubmit(data: ProductFormValues) {
    const cleanData: Record<string, unknown> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value) cleanData[key] = value;
    });
    cleanData.attachment = attachment || undefined;

    cleanData.parentId = data.parentId || '';
    const fieldsToUpdate = Object.keys(cleanData);
    productCategoriesEdit(
      {
        variables: {
          _id: categoryId,
          ...cleanData,
        },
        onError: (e: { message: string }) => {
          toast({
            title: t('error'),
            description: e.message,
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          toast({
            title: t('category-updated'),
            variant: 'success',
          });
          if (currentSelection.current !== selection) return;
          form.reset();
          setOpen(null);
        },
      },
      fieldsToUpdate,
    );
  }

  return (
    <ProductEditorPanel
      name={`categories/${categoryId || 'detail'}`}
      open={Boolean(categoryId)}
      onOpenChange={(isOpen) => !isOpen && setOpen(null)}
      requiredPermission="productCategoriesManage"
    >
      {loading ? (
        <>
          <ProductEditorHeader title={t('edit-category')} />
          <div className="flex flex-1 items-center justify-center p-5 text-muted-foreground">
            <IconLoader2 className="size-4 animate-spin" />
          </div>
        </>
      ) : error || !categoryDetail ? (
        <>
          <ProductEditorHeader title={t('edit-category')} />
          <div className="p-5 text-sm text-destructive">
            {error?.message || t('failed-to-load-category')}
          </div>
        </>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex overflow-hidden flex-col h-full"
          >
            <ProductEditorHeader title={t('edit-category')} />

            <Sheet.Content className="overflow-hidden flex-auto">
              <ScrollArea className="h-full">
                <div className="p-5">
                  <CategoriesUpdateCoreFields
                    form={form}
                    categoryDetail={categoryDetail}
                  />
                  <CategoryUpdateMoreFields
                    form={form}
                    categoryDetail={categoryDetail}
                    attachment={attachment}
                    onAttachmentChange={setAttachment}
                  />
                </div>
              </ScrollArea>
            </Sheet.Content>

            <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(null)}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? t('saving') : t('save')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      )}
    </ProductEditorPanel>
  );
};
