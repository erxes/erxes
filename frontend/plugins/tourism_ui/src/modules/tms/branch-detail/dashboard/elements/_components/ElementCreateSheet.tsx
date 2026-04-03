import { IconPlus } from '@tabler/icons-react';
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
import { useCreateElement } from '../hooks/useCreateElement';
import { useElementLanguage } from '../hooks/useElementLanguage';
import {
  buildEmptyTranslations,
  sanitizeTranslations,
} from '../utils/translationHelpers';

interface ElementCreateSheetProps {
  branchId?: string;
  branchLanguages?: string[];
  mainLanguage?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export const ElementCreateSheet = ({
  branchId,
  branchLanguages,
  mainLanguage,
  open,
  onOpenChange,
  showTrigger = true,
}: ElementCreateSheetProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const sheetOpen = typeof open === 'boolean' ? open : internalOpen;

  const handleOpenChange = (value: boolean) => {
    if (onOpenChange) onOpenChange(value);
    else setInternalOpen(value);
  };

  const { createElement, loading } = useCreateElement();
  const { toast } = useToast();

  const form = useForm<ElementCreateFormType>({
    resolver: zodResolver(ElementCreateFormSchema),
    defaultValues: {
      name: '',
      note: '',
      startTime: '',
      duration: 0,
      cost: 0,
      categories: [],
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
    currencySymbol,
    fieldPaths,
  } = useElementLanguage({ branchLanguages, mainLanguage, fields });

  useEffect(() => {
    if (!translationLanguages.length) return;
    const current = form.getValues('translations') || [];
    const currentLangs = current.map((t) => t.language);
    if (!translationLanguages.every((l) => currentLangs.includes(l))) {
      form.setValue(
        'translations',
        buildEmptyTranslations(translationLanguages),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationLanguages.join(',')]);

  const onInvalid = () => {
    const nameValue = form.getValues('name');
    if (!nameValue?.trim()) {
      toast({
        title: 'Error',
        description:
          'Please enter values for the main language before creating.',
        variant: 'destructive',
      });
      setSelectedLang(mainLanguage || allLanguages[0] || '');
    }
  };

  const handleSubmit = async (values: ElementCreateFormType) => {
    if (!branchId) {
      toast({
        title: 'Error',
        description: 'Branch is required to create an element',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createElement({
        variables: {
          branchId,
          name: values.name,
          note: values.note,
          startTime: values.startTime,
          duration: values.duration,
          cost: values.cost,
          categories: values.categories,
          quick: false,
          language: mainLanguage,
          translations: sanitizeTranslations(values.translations),
        },
      });

      toast({ title: 'Success', description: 'Element created successfully' });
      form.reset();
      handleOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create element',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <Sheet.Trigger asChild>
          <Button type="button">
            <IconPlus />
            Create element
          </Button>
        </Sheet.Trigger>
      )}

      <Sheet.View className="w-[600px] sm:max-w-[600px] p-0">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation();
              form.handleSubmit(handleSubmit, onInvalid)(e);
            }}
            className="flex flex-col h-full"
          >
            <Sheet.Header>
              <Sheet.Title>Create element</Sheet.Title>
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
              <div key={selectedLang} className="flex flex-col gap-6">
                <div className="space-y-4">
                  <ElementNameField
                    control={form.control}
                    name={fieldPaths.name}
                    labelSuffix={labelSuffix}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <ElementStartTimeField control={form.control} />
                    <ElementDurationField control={form.control} />
                    <ElementCostField
                      control={form.control}
                      name={fieldPaths.cost}
                      currencySymbol={currencySymbol}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <SelectElementCategories control={form.control} />
                  <ElementNoteField
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
                {loading ? 'Creating...' : 'Create'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
