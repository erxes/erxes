import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ScrollArea,
  Sheet,
  Form,
  useToast,
  useErxesUpload,
  useRemoveFile,
  IAttachment,
} from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { useFieldGroups, useFields } from 'ui-modules';
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
  const [files, setFiles] = useState<IAttachment[]>([]);
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

  useEffect(() => {
    const current = form.getValues('similarities') || [];
    form.setValue(
      'similarities',
      current.map((item) => ({ ...item, id: item.id || `${Date.now()}` })),
    );
  }, [form, fieldGroups.length, fields.length]);

  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
    maxFileSize: 20 * 1024 * 1024,
    onFilesAdded: (added) => {
      setFiles((prev) => [
        ...prev.filter(
          (f) => !added.some((a) => (a.name ?? a.url) === (f.name ?? f.url)),
        ),
        ...added.map((f) => ({
          name: f.name ?? f.url,
          url: f.url,
          type: f.type,
          size: f.size,
        })),
      ]);
    },
  });

  async function onSubmit(data: ProductFormValues) {
    const cleanData: Record<string, any> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        cleanData[key] = value;
      }
    });

    const attachment =
      files.length > 0
        ? {
            url: files[0].url,
            name: files[0].name,
            type: files[0].type,
          }
        : undefined;

    productCategoriesAdd({
      variables: {
        ...cleanData,
        name: cleanData.name ?? '',
        code: cleanData.code ?? '',
        attachment,
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
        onOpenChange(false);
      },
    });
  }

  const handleCancel = () => {
    form.reset();
    setFiles([]);
    onOpenChange(false);
  };

  const {
    removeFile,
  }: {
    removeFile: (name: string, cb: (status: string) => void) => void;
  } = useRemoveFile();

  const handleRemoveFile = (file: IAttachment) => {
    removeFile(file.name, (status: string) => {
      if (status === 'ok') {
        setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
      }
    });
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
                files={files}
                isLoading={uploadProps.loading}
                uploadProps={uploadProps}
                onRemoveFile={handleRemoveFile}
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
