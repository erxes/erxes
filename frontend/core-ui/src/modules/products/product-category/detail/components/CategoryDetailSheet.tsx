import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  cn,
  Sheet,
  ScrollArea,
  Form,
  useToast,
  useSetHotkeyScope,
  useQueryState,
} from 'erxes-ui';
import { renderingCategoryDetailAtom } from '../../states/ProductCategory';
import { CategoryHotKeyScope } from '../../types/CategoryHotKeyScope';
import { CategoriesUpdateCoreFields } from './CategoryUpdateCoreFields';
import { useProductCategoriesEdit } from '../hooks/useUpdateCategory';
import {
  productFormSchema,
  ProductFormValues,
} from '../../add-category/components/formSchema';
import { CategoryUpdateMoreFields } from './CategoryUpdateMoreFields';
import { ProductAddCollapsible } from '@/products/add-products/components/ProductAddCollapsible';

export const CategoryDetailSheet = () => {
  const [activeTab] = useAtom(renderingCategoryDetailAtom);
  const setHotkeyScope = useSetHotkeyScope();
  const [categoryId, setCategoryId] = useQueryState<string>('category_id');

  const { toast } = useToast();
  const { productCategoriesEdit, loading: editLoading } =
    useProductCategoriesEdit();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      code: '',
      categoryId: '',
      description: '',
      attachment: null,
      accountMaskType: '',
      state: '',
      meta: '',
      scopeBrandIds: [],
    },
  });

  useEffect(() => {
    if (categoryId) {
      setHotkeyScope(CategoryHotKeyScope.CategoryEditSheet);
    }
  }, [categoryId, setHotkeyScope]);

  const setOpen = (newCategoryId: string | null) => {
    setCategoryId(newCategoryId);

    if (!newCategoryId) {
      setHotkeyScope(CategoryHotKeyScope.CategoriesPage);
    }
  };

  async function onSubmit(data: ProductFormValues) {
    const cleanData: Record<string, any> = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value) cleanData[key] = value;
    });
    const fieldsToUpdate = ['name', 'code', 'categoryId'];
    productCategoriesEdit(
      {
        variables: {
          _id: categoryId,
          ...cleanData,
        },
        onError: (e: { message: any }) => {
          toast({
            title: 'Error',
            description: e.message,
          });
        },
        onCompleted: () => {
          toast({
            title: 'Success',
            description: 'Category updated successfully',
          });
          form.reset();
          setOpen(null);
        },
      },
      fieldsToUpdate,
    );
  }

  return (
    <Sheet
      open={!!categoryId}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(null);
          setHotkeyScope(CategoryHotKeyScope.CategoriesPage);
        }
      }}
    >
      <Sheet.View
        className={cn(
          'p-0 md:max-w-screen-[520px] flex flex-col gap-0 transition-all duration-100 ease-out overflow-hidden flex-none',
          !!activeTab && 'md:w-[calc(100vw-theme(spacing.4))]',
        )}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full overflow-hidden"
          >
            <Sheet.Header className="border-b p-3 flex-row items-center space-y-0 gap-3">
              <Sheet.Title>Edit Category</Sheet.Title>
              <Sheet.Close />
              <Sheet.Description className="sr-only">
                Edit Category Details
              </Sheet.Description>
            </Sheet.Header>

            <Sheet.Content className="flex-auto overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-5">
                  <CategoriesUpdateCoreFields form={form} />
                  <ProductAddCollapsible>
                    <CategoryUpdateMoreFields form={form} />
                  </ProductAddCollapsible>
                </div>
              </ScrollArea>
            </Sheet.Content>

            <Sheet.Footer className="flex justify-end flex-shrink-0 p-2.5 gap-1 bg-muted">
              <Button
                type="button"
                variant="ghost"
                className="bg-background hover:bg-background/90"
                onClick={() => setOpen(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={editLoading}
              >
                {editLoading ? 'Saving...' : 'Save'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
