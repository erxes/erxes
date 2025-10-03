import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ScrollArea, Sheet, Form, useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { productFormSchema, ProductFormValues } from './formSchema';
import { CategoryAddSheetHeader } from '../../components/AddProductCategoryForm';
import { ProductCategoriesAddCoreFields } from './CategoryAddCoreFields';
import { ProductCategoryAddMoreFields } from './CategoryAddMoreFields';
import { useAddCategory } from '../hooks/useAddCategory';
import { ProductAddCollapsible } from '@/products/add-products/components/ProductAddCollapsible';

export function AddCategoryForm({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const { productCategoriesAdd, loading: editLoading } = useAddCategory();
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
  const { toast } = useToast();
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
      },
      onError: (e: ApolloError) => {
        toast({
          title: 'Error',
          description: e.message,
        });
      },
      onCompleted: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  }

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden"
      >
        <CategoryAddSheetHeader />
        <Sheet.Content className="flex-auto overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-5">
              <ProductCategoriesAddCoreFields form={form} />
              <ProductAddCollapsible>
                <ProductCategoryAddMoreFields form={form} />
              </ProductAddCollapsible>
            </div>
          </ScrollArea>
        </Sheet.Content>

        <Sheet.Footer className="flex justify-end flex-shrink-0 p-2.5 gap-1 bg-muted">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={handleCancel}
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
  );
}
