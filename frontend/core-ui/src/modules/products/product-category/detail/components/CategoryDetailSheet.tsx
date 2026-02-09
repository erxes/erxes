import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconLoader2 } from '@tabler/icons-react';
import {
  Button,
  cn,
  Sheet,
  ScrollArea,
  Form,
  useToast,
  useSetHotkeyScope,
  useQueryState,
  useErxesUpload,
  useRemoveFile,
  IAttachment,
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
import { useProductCategoryDetail } from '../hooks/useCategoryDetail';

type UploadAddedFile = {
  name?: string;
  url: string;
  type?: string;
  size?: number;
};

const mergeAddedFiles = (
  previousFiles: IAttachment[],
  addedFiles: UploadAddedFile[],
): IAttachment[] => {
  const normalizedAdded = addedFiles.map((file) => ({
    name: file.name ?? file.url,
    url: file.url,
    type: file.type ?? '',
    size: file.size ?? 0,
  }));

  const addedNames = new Set(
    normalizedAdded.map((file) => file.name ?? file.url),
  );
  const remainingFiles = previousFiles.filter(
    (file) => !addedNames.has(file.name ?? file.url),
  );

  return [...remainingFiles, ...normalizedAdded];
};

export const CategoryDetailSheet = () => {
  const [activeTab] = useAtom(renderingCategoryDetailAtom);
  const setHotkeyScope = useSetHotkeyScope();
  const [categoryId, setCategoryId] = useQueryState<string>('category_id');
  const [files, setFiles] = useState<IAttachment[]>([]);

  const { toast } = useToast();
  const { productCategoriesEdit, loading: editLoading } =
    useProductCategoriesEdit();

  const { categoryDetail, loading, error } = useProductCategoryDetail();
  const { removeFile } = useRemoveFile();

  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: 1,
    maxFileSize: 20 * 1024 * 1024,
    onFilesAdded: (added) => {
      setFiles((prev) => {
        const maxFiles = 1;
        if (maxFiles === 1) {
          return added.map((file) => ({
            name: file.name ?? file.url,
            url: file.url,
            type: file.type ?? '',
            size: file.size ?? 0,
          }));
        }
        return mergeAddedFiles(prev, added);
      });
    },
  });

  const handleRemoveFile = (file: IAttachment) => {
    removeFile(file.name, (status: string) => {
      if (status === 'ok') {
        setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name));
      }
    });
  };

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
    setFiles((prevFiles) => {
      const attachmentUrl = categoryDetail?.attachment?.url;
      const currentFileUrl = prevFiles[0]?.url;

      if (attachmentUrl && attachmentUrl !== currentFileUrl) {
        return [
          {
            name: categoryDetail.attachment.name,
            url: categoryDetail.attachment.url,
            type: categoryDetail.attachment.type,
            size: categoryDetail.attachment.size,
          },
        ];
      }

      if (!attachmentUrl && prevFiles.length === 0) {
        return prevFiles;
      }

      if (!attachmentUrl && prevFiles.length > 0) {
        return [];
      }

      return prevFiles;
    });
  }, [categoryDetail?._id, categoryDetail?.attachment?.url]);

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
    const fieldsToUpdate = Object.keys(cleanData);
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
            variant: 'destructive',
          });
        },
        onCompleted: () => {
          toast({
            title: 'Category updated successfully',
            variant: 'success',
          });
          form.reset();
          setOpen(null);
        },
      },
      fieldsToUpdate,
    );
  }

  if (loading) {
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
            !!activeTab && 'md:w-[calc(100vw-(--spacing(4)))]',
          )}
        >
          <div className="flex flex-1 min-h-[200px] items-center justify-center p-5 text-muted-foreground">
            <IconLoader2 className="w-4 h-4 animate-spin" />
          </div>
        </Sheet.View>
      </Sheet>
    );
  }

  if (error) {
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
            !!activeTab && 'md:w-[calc(100vw-(--spacing(4)))]',
          )}
        >
          <div className="p-5 text-sm text-destructive">
            {error?.message || 'Failed to load category.'}
          </div>
        </Sheet.View>
      </Sheet>
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
          !!activeTab && 'md:w-[calc(100vw-(--spacing(4)))]',
        )}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex overflow-hidden flex-col h-full"
          >
            <Sheet.Header className="flex-row gap-3 items-center p-3 space-y-0 border-b">
              <Sheet.Title>Edit Category</Sheet.Title>
              <Sheet.Close />
              <Sheet.Description className="sr-only">
                Edit Category Details
              </Sheet.Description>
            </Sheet.Header>

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
                    files={files}
                    isLoading={uploadProps.loading}
                    uploadProps={uploadProps}
                    onRemoveFile={handleRemoveFile}
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
                Cancel
              </Button>
              <Button type="submit" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
