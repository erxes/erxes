import { IconEdit } from '@tabler/icons-react';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  AmenityCreateFormSchema,
  AmenityCreateFormType,
} from '../constants/formSchema';

import { AmenityNameField, AmenityIconField } from './AmenityFormFields';
import { useEditAmenity } from '../hooks/useEditAmenity';
import { IAmenity } from '../types/amenity';
import { useAmenityLanguage } from '../hooks/useAmenityLanguage';
import { TourFieldLanguageSwitch } from '@/tms/branch-detail/dashboard/_components/TourFieldLanguageSwitch';
import {
  buildTranslationsFromAmenity,
  resolveMainLanguageName,
  sanitizeAmenityTranslations,
} from '../utils/translationHelpers';

interface AmenityEditSheetProps {
  amenity: IAmenity;
  branchLanguages?: string[];
  mainLanguage?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  children?: React.ReactNode;
}

export const AmenityEditSheet = ({
  amenity,
  branchLanguages,
  mainLanguage,
  open,
  onOpenChange,
  showTrigger = true,
  children,
}: AmenityEditSheetProps) => {
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

  const { editAmenity, loading } = useEditAmenity();
  const { toast } = useToast();

  // Compute translation languages early so defaultValues has correct translations
  const allLanguages = useMemo(() => {
    const base =
      branchLanguages && branchLanguages.length > 0
        ? branchLanguages
        : mainLanguage
          ? [mainLanguage]
          : [];
    if (mainLanguage && !base.includes(mainLanguage)) {
      return [mainLanguage, ...base];
    }
    return base;
  }, [branchLanguages, mainLanguage]);

  const primaryLanguage = mainLanguage ?? allLanguages[0] ?? '';

  const translationLanguages = useMemo(
    () => allLanguages.filter((l) => l !== primaryLanguage),
    [allLanguages, primaryLanguage],
  );

  const form = useForm<AmenityCreateFormType>({
    resolver: zodResolver(AmenityCreateFormSchema),
    defaultValues: {
      name: resolveMainLanguageName(amenity, mainLanguage),
      icon: amenity.icon || '',
      translations: buildTranslationsFromAmenity(amenity, translationLanguages),
    },
  });

  useFieldArray({
    control: form.control,
    name: 'translations',
  });

  const { selectedLang, setSelectedLang, isMainLang, labelSuffix, fieldPaths } =
    useAmenityLanguage({ branchLanguages, mainLanguage });

  useEffect(() => {
    form.reset({
      name: resolveMainLanguageName(amenity, mainLanguage),
      icon: amenity.icon || '',
      translations: buildTranslationsFromAmenity(amenity, translationLanguages),
    });
    const resolvedPrimary = mainLanguage || allLanguages[0] || '';
    setSelectedLang((prev) =>
      allLanguages.includes(prev) ? prev : resolvedPrimary,
    );
  }, [
    amenity,
    translationLanguages,
    mainLanguage,
    allLanguages,
    form,
    setSelectedLang,
  ]);

  const handleSubmit = async (values: AmenityCreateFormType) => {
    // values.name is always the main-language value because:
    //  - Form was initialized with the resolved main-language name
    //  - fieldPaths routes main-lang edits to `name`, others to translations[]
    const mainName = isMainLang
      ? values.name
      : values.name ||
        values.translations?.find((t) => t.language === mainLanguage)?.name ||
        amenity.name ||
        '';

    try {
      await editAmenity({
        variables: {
          id: amenity._id,
          name: mainName,
          ...(values.icon &&
            values.icon.trim() !== '' && { icon: values.icon }),
          quick: true,
          language: mainLanguage,
          translations: sanitizeAmenityTranslations(values.translations),
        },
      });

      toast({
        title: 'Success',
        description: 'Amenity updated successfully',
      });

      handleOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update amenity',
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
              <Sheet.Title>Edit amenity</Sheet.Title>
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
                    key={fieldPaths.name}
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
                {loading ? 'Updating...' : 'Update'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
