import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ScrollArea, Sheet, Form, useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import {
  type ProductAttachmentItem,
  useFieldGroups,
  useFields,
} from 'ui-modules';
import { productFormSchema, ProductFormValues } from './formSchema';
import { CategoryAddSheetHeader } from '../../components/AddProductCategoryForm';
import { ProductCategoriesAddCoreFields } from './CategoryAddCoreFields';
import { ProductCategoryAddMoreFields } from './CategoryAddMoreFields';
import { useAddCategory } from '../hooks/useAddCategory';

export function AddCategoryForm({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
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
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Category added successfully',
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
        <Sheet.Content className="overflow-hidden flex-auto">
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
        </Sheet.Content>

        <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
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
