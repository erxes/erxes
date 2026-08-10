import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useCreateCategory } from '../hooks/useCreateCategory';
import { useCategoryLanguage } from '../hooks/useCategoryLanguage';
import { TourFieldLanguageSwitch } from '@/tms/branch-detail/dashboard/_components/TourFieldLanguageSwitch';
import {
  buildEmptyCategoryTranslations,
  sanitizeCategoryTranslations,
} from '../utils/translationHelpers';

interface CategoryCreateSheetProps {
  branchId?: string;
  branchLanguages?: string[];
  mainLanguage?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export const CategoryCreateSheet = ({
  branchId,
  branchLanguages,
  mainLanguage,
  open,
  onOpenChange,
  showTrigger = true,
}: CategoryCreateSheetProps) => {
  const { t } = useTranslation('tourism');
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
      translations: [],
    },
  });

  useFieldArray({
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
  } = useCategoryLanguage({ branchLanguages, mainLanguage });

  useEffect(() => {
    if (!translationLanguages.length) return;
    const current = form.getValues('translations') || [];
    const currentLangs = current.map((t) => t.language);
    if (!translationLanguages.every((l) => currentLangs.includes(l))) {
      form.setValue(
        'translations',
        buildEmptyCategoryTranslations(translationLanguages),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationLanguages.join(',')]);

  const onInvalid = () => {
    const nameValue = form.getValues('name');
    if (!nameValue?.trim()) {
      toast({
        title: t('error'),
        description: t('enter-main-lang-before-creating'),
        variant: 'destructive',
      });
      setSelectedLang(mainLanguage || allLanguages[0] || '');
    }
  };

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
          language: mainLanguage,
          translations: sanitizeCategoryTranslations(values.translations),
        },
      });

      toast({
        title: t('success'),
        description: t('category-created-successfully'),
      });

      form.reset({
        name: '',
        code: '',
        parentId: '',
        translations: buildEmptyCategoryTranslations(translationLanguages),
      });
      setSelectedLang(mainLanguage || allLanguages[0] || '');
      handleOpenChange(false);
    } catch (error) {
      toast({
        title: t('error'),
        description:
          error instanceof Error ? error.message : t('failed-to-create-category'),
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
            {t('create-category')}
          </Button>
        </Sheet.Trigger>
      )}

      <Sheet.View className="w-[400px] sm:max-w-[400px] p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, onInvalid)}
            className="flex flex-col h-full"
          >
            <Sheet.Header>
              <Sheet.Title>{t('create-category')}</Sheet.Title>
              {allLanguages.length > 1 && (
                <div className="flex gap-2 items-center ml-auto">
                  <TourFieldLanguageSwitch
                    availableLanguages={allLanguages}
                    value={selectedLang}
                    onValueChange={setSelectedLang}
                  />
                </div>
              )}
            </Sheet.Header>

            <Sheet.Content className="overflow-y-auto flex-1 px-6 py-4 rounded-none">
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <CategoryNameField
                    key={fieldPaths.name}
                    control={form.control}
                    name={fieldPaths.name}
                    labelSuffix={labelSuffix}
                  />
                  <CategoryCodeField control={form.control} />
                  <CategoryParentIdField
                    control={form.control}
                    branchId={branchId}
                    language={selectedLang}
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
                {t('cancel')}
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? t('creating') : t('create')}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
