import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  AmenityCreateFormSchema,
  AmenityCreateFormType,
} from '../constants/formSchema';

import { AmenityNameField, AmenityIconField } from './AmenityFormFields';
import { useCreateAmenity } from '../hooks/useCreateAmenity';
import { useAmenityLanguage } from '../hooks/useAmenityLanguage';
import { TourFieldLanguageSwitch } from '@/tms/branch-detail/dashboard/_components/TourFieldLanguageSwitch';
import {
  buildEmptyAmenityTranslations,
  sanitizeAmenityTranslations,
} from '../utils/translationHelpers';

interface AmenityCreateSheetProps {
  branchId?: string;
  branchLanguages?: string[];
  mainLanguage?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export const AmenityCreateSheet = ({
  branchId,
  branchLanguages,
  mainLanguage,
  open,
  onOpenChange,
  showTrigger = true,
}: AmenityCreateSheetProps) => {
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

  const { createAmenity, loading } = useCreateAmenity();
  const { toast } = useToast();

  const form = useForm<AmenityCreateFormType>({
    resolver: zodResolver(AmenityCreateFormSchema),
    defaultValues: {
      name: '',
      icon: '',
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
  } = useAmenityLanguage({ branchLanguages, mainLanguage, fields });

  useEffect(() => {
    if (!translationLanguages.length) return;
    const current = form.getValues('translations') || [];
    const currentLangs = current.map((t) => t.language);
    if (!translationLanguages.every((l) => currentLangs.includes(l))) {
      form.setValue(
        'translations',
        buildEmptyAmenityTranslations(translationLanguages),
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

  const handleSubmit = async (values: AmenityCreateFormType) => {
    if (!branchId) {
      toast({
        title: 'Error',
        description: 'Branch is required to create an amenity',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createAmenity({
        variables: {
          branchId,
          name: values.name,
          ...(values.icon &&
            values.icon.trim() !== '' && { icon: values.icon }),
          quick: true,
          language: mainLanguage,
          translations: sanitizeAmenityTranslations(values.translations),
        },
      });

      toast({
        title: 'Success',
        description: 'Amenity created successfully',
      });

      form.reset();
      handleOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create amenity',
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
            Create amenity
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
              <Sheet.Title>Create amenity</Sheet.Title>
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
                  <AmenityNameField
                    control={form.control}
                    name={fieldPaths.name}
                    labelSuffix={labelSuffix}
                  />
                  <AmenityIconField control={form.control} />
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
