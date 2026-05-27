import { IconEdit } from '@tabler/icons-react';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  ElementCreateFormSchema,
  ElementCreateFormType,
} from '../constants/formSchema';
import {
  ElementNameField,
  ElementNoteField,
  ElementStartTimeField,
  ElementDurationField,
  ElementCostField,
} from './ElementFormFields';
import { SelectElementCategories } from './SelectElementCategories';
import { TourFieldLanguageSwitch } from '@/tms/branch-detail/dashboard/_components/TourFieldLanguageSwitch';
import { useEditElement } from '../hooks/useEditElement';
import { useElementLanguage } from '../hooks/useElementLanguage';
import { IElement } from '../types/element';
import {
  buildTranslationsFromElement,
  sanitizeTranslations,
  resolveMainLanguageName,
} from '../utils/translationHelpers';

interface ElementEditSheetProps {
  element: IElement;
  branchLanguages?: string[];
  mainLanguage?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  children?: React.ReactNode;
}

export const ElementEditSheet = ({
  element,
  branchLanguages,
  mainLanguage,
  open,
  onOpenChange,
  showTrigger = true,
  children,
}: ElementEditSheetProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const sheetOpen = typeof open === 'boolean' ? open : internalOpen;

  const handleOpenChange = (value: boolean) => {
    if (onOpenChange) onOpenChange(value);
    else setInternalOpen(value);
  };

  const { editElement, loading } = useEditElement();
  const { toast } = useToast();

  const form = useForm<ElementCreateFormType>({
    resolver: zodResolver(ElementCreateFormSchema),
    defaultValues: {
      name: resolveMainLanguageName(element, mainLanguage),
      note: element.note || '',
      startTime: element.startTime || '',
      duration: element.duration || 0,
      cost: element.cost || 0,
      categories: element.categories || [],
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
    currencySymbol,
    fieldPaths,
  } = useElementLanguage({ branchLanguages, mainLanguage });

  const resolvedPrimaryLanguage = mainLanguage ?? allLanguages[0] ?? '';

  useEffect(() => {
    form.reset({
      name: resolveMainLanguageName(element, mainLanguage),
      note: element.note || '',
      startTime: element.startTime || '',
      duration: element.duration || 0,
      cost: element.cost || 0,
      categories: element.categories || [],
      translations: buildTranslationsFromElement(element, translationLanguages),
    });
    // Preserve active lang if valid for this branch; fall back to primary
    const resolvedPrimary = mainLanguage || allLanguages[0] || '';
    setSelectedLang((prev) =>
      allLanguages.includes(prev) ? prev : resolvedPrimary,
    );
  }, [
    element,
    translationLanguages,
    resolvedPrimaryLanguage,
    mainLanguage,
    allLanguages,
    form,
    setSelectedLang,
  ]);

  const handleSubmit = async (values: ElementCreateFormType) => {
    try {
      await editElement({
        variables: {
          id: element._id,
          name: values.name,
          note: values.note,
          startTime: values.startTime,
          duration: values.duration,
          cost: values.cost,
          categories: values.categories,
          quick: false,
          language: resolvedPrimaryLanguage,
          translations: sanitizeTranslations(values.translations),
        },
      });

      toast({ title: 'Success', description: 'Element updated successfully' });
      handleOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update element',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      {showTrigger && !children && (
        <Sheet.Trigger asChild>
          <Button type="button" variant="ghost" size="sm">
            <IconEdit size={16} />
          </Button>
        </Sheet.Trigger>
      )}
      {children && <Sheet.Trigger asChild>{children}</Sheet.Trigger>}

      <Sheet.View className="w-[600px] sm:max-w-[600px] p-0">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation();
              form.handleSubmit(handleSubmit)(e);
            }}
            className="flex flex-col h-full"
          >
            <Sheet.Header>
              <Sheet.Title>Edit element</Sheet.Title>
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

            <Sheet.Content className="flex-1 px-6 py-4 overflow-y-auto rounded-none">
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <ElementNameField
                    key={fieldPaths.name}
                    control={form.control}
                    name={fieldPaths.name}
                    labelSuffix={labelSuffix}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <ElementStartTimeField control={form.control} />
                    <ElementDurationField control={form.control} />
                    <ElementCostField
                      key={fieldPaths.cost}
                      control={form.control}
                      name={fieldPaths.cost}
                      currencySymbol={currencySymbol}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <SelectElementCategories control={form.control} />
                  <ElementNoteField
                    key={fieldPaths.note}
                    control={form.control}
                    name={fieldPaths.note}
                    labelSuffix={labelSuffix}
                  />
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
