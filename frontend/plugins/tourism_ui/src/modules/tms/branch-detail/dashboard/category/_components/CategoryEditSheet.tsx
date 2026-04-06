import { IconEdit } from '@tabler/icons-react';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { useCategoryLanguage } from '../hooks/useCategoryLanguage';
import { TourFieldLanguageSwitch } from '@/tms/branch-detail/dashboard/_components/TourFieldLanguageSwitch';
import {
  buildTranslationsFromCategory,
  sanitizeCategoryTranslations,
} from '../utils/translationHelpers';

interface CategoryEditSheetProps {
  category: ICategory;
  branchLanguages?: string[];
  mainLanguage?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  children?: React.ReactNode;
}

export const CategoryEditSheet = ({
  category,
  branchLanguages,
  mainLanguage,
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
      translations: [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'translations',
  });

  const {
    allLanguages,
    translationLanguages,
    selectedLang,
    setSelectedLang,
    labelSuffix,
    fieldPaths,
  } = useCategoryLanguage({ branchLanguages, mainLanguage, fields });

  useEffect(() => {
    form.reset({
      name: category.name || '',
      code: category.code || '',
      parentId: category.parentId || '',
      attachment: category.attachment ?? undefined,
      translations: buildTranslationsFromCategory(
        category,
        translationLanguages,
      ),
    });
    // Preserve active lang if valid for this branch; fall back to primary
    const resolvedPrimary = mainLanguage || allLanguages[0] || '';
    setSelectedLang((prev) =>
      allLanguages.includes(prev) ? prev : resolvedPrimary,
    );
  }, [
    category,
    translationLanguages,
    mainLanguage,
    allLanguages,
    form,
    setSelectedLang,
  ]);

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
          language: mainLanguage,
          translations: sanitizeCategoryTranslations(values.translations),
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
              {allLanguages.length > 1 && (
                <div className="flex items-center gap-2 ml-auto">
                  <TourFieldLanguageSwitch
                    availableLanguages={allLanguages}
                    value={selectedLang}
                    onValueChange={setSelectedLang}
                  />
                </div>
              )}
            </Sheet.Header>

            <Sheet.Content className="overflow-y-auto flex-1 px-6 py-4 rounded-none">
              <div key={selectedLang} className="flex flex-col gap-6">
                <div className="space-y-4">
                  <CategoryNameField
                    control={form.control}
                    name={fieldPaths.name}
                    labelSuffix={labelSuffix}
                  />
                  <CategoryCodeField control={form.control} />
                  <CategoryParentIdField
                    control={form.control}
                    branchId={category.branchId}
                  />
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
