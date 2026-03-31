import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { useState } from 'react';
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
import { useCreateCategory } from '../hooks/useCreateCategory';

interface CategoryCreateSheetProps {
  branchId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export const CategoryCreateSheet = ({
  branchId,
  open,
  onOpenChange,
  showTrigger = true,
}: CategoryCreateSheetProps) => {
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

  const { createCategory, loading } = useCreateCategory();
  const { toast } = useToast();

  const form = useForm<CategoryCreateFormType>({
    resolver: zodResolver(CategoryCreateFormSchema),
    defaultValues: {
      name: '',
      code: '',
      parentId: '',
    },
  });

  const handleSubmit = async (values: CategoryCreateFormType) => {
    try {
      await createCategory({
        variables: {
          name: values.name,
          code: values.code,
          ...(values.parentId &&
            values.parentId.trim() !== '' && { parentId: values.parentId }),
          ...(branchId && { branchId }),
          ...(values.attachment && { attachment: values.attachment }),
        },
      });

      toast({
        title: 'Success',
        description: 'Category created successfully',
      });

      form.reset();
      handleOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create category',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            Create category
          </Button>
        </Sheet.Trigger>
      )}

      <Sheet.View className="w-[400px] sm:max-w-[400px] p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full"
          >
            <Sheet.Header>
              <Sheet.Title>Create category</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="overflow-y-auto flex-1 px-6 py-4 rounded-none">
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <CategoryNameField control={form.control} />
                  <CategoryCodeField control={form.control} />
                  <CategoryParentIdField control={form.control} branchId={branchId} />
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
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
