import { IconEdit } from '@tabler/icons-react';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  CategoryCreateFormSchema,
  CategoryCreateFormType,
} from '../constants/formSchema';

import {
  CategoryNameField,
  CategoryParentIdField,
  CategoryAttachmentField,
  CategoryCodeField,
} from './CategoryFormFields';
import { useEditCategory } from '../hooks/useEditCategory';
import { ICategory } from '../types/category';

interface CategoryEditSheetProps {
  category: ICategory;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  children?: React.ReactNode;
}

export const CategoryEditSheet = ({
  category,
  open,
  onOpenChange,
  showTrigger = true,
  children,
}: CategoryEditSheetProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = typeof open === 'boolean';
  const sheetOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };

  const { editCategory, loading } = useEditCategory();
  const { toast } = useToast();
  const normalizedAttachment = category.attachment ?? undefined;

  const form = useForm<CategoryCreateFormType>({
    resolver: zodResolver(CategoryCreateFormSchema),
    defaultValues: {
      name: category.name || '',
      code: category.code || '',
      parentId: category.parentId || '',
      attachment: normalizedAttachment,
    },
  });

  useEffect(() => {
    form.reset({
      name: category.name || '',
      code: category.code || '',
      parentId: category.parentId || '',
      attachment: category.attachment ?? undefined,
    });
  }, [category, form]);

  const handleSubmit = async (values: CategoryCreateFormType) => {
    try {
      await editCategory({
        variables: {
          id: category._id,
          name: values.name,
          code: values.code,
          ...(values.parentId &&
            values.parentId.trim() !== '' && { parentId: values.parentId }),
          ...(category.branchId && { branchId: category.branchId }),
          ...(values.attachment && { attachment: values.attachment }),
        },
      });

      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });

      handleOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update category',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      {showTrigger && !children && (
        <Sheet.Trigger asChild>
          <Button variant="ghost" size="sm">
            <IconEdit size={16} />
          </Button>
        </Sheet.Trigger>
      )}
      {children && <Sheet.Trigger asChild>{children}</Sheet.Trigger>}

      <Sheet.View className="w-[400px] sm:max-w-[400px] p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full"
          >
            <Sheet.Header>
              <Sheet.Title>Edit category</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="overflow-y-auto flex-1 px-6 py-4 rounded-none">
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <CategoryNameField control={form.control} />
                  <CategoryCodeField control={form.control} />
                  <CategoryParentIdField control={form.control} branchId={category.branchId} />
                  <CategoryAttachmentField control={form.control} />
                </div>
              </div>
            </Sheet.Content>

            <Sheet.Footer className="bg-background">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
