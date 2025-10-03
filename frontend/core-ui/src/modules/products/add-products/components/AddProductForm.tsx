import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { Button, ScrollArea, Sheet, Form, useToast } from 'erxes-ui';

import { ProductAddCollapsible } from './ProductAddCollapsible';
import { ProductAddCoreFields } from './ProductAddCoreFields';
import { ProductAddMoreFields } from './ProductAddMoreFields';
import { ProductAddSheetHeader } from './ProductAddSheet';

import {
  productFormSchema,
  ProductFormValues,
} from '@/products/add-products/components/formSchema';
import { useAddProduct } from '@/products/hooks/useAddProduct';
import { ApolloError } from '@apollo/client';

export function AddProductForm({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const { productsAdd } = useAddProduct();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      code: '',
      categoryId: '',
      vendorId: '',
      type: 'product',
      uom: '',
      shortName: '',
      attachment: null,
      attachmentMore: null,
      description: '',
      pdfAttachment: {},
      subUoms: [],
      barcodes: [],
      variants: {},
      barcodeDescription: '',
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

    productsAdd({
      variables: cleanData,
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden"
      >
        <ProductAddSheetHeader />
        <Sheet.Content className="flex-auto overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-5">
              <ProductAddCoreFields form={form} />
              <ProductAddCollapsible>
                <ProductAddMoreFields form={form} />
              </ProductAddCollapsible>
            </div>
          </ScrollArea>
        </Sheet.Content>

        <Sheet.Footer className="flex justify-end flex-shrink-0 p-2.5 gap-1 bg-muted">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
}
