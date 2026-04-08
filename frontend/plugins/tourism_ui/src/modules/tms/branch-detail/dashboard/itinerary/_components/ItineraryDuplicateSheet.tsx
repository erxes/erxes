import { useEffect } from 'react';
import { Button, Form, Sheet, Spinner, useToast } from 'erxes-ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateItinerary } from '../hooks/useCreateItinerary';
import { IItinerary } from '../types/itinerary';
import { useItineraryDetail } from '../hooks/useItineraryDetail';
import {
  ItineraryCreateFormSchema,
  ItineraryCreateFormType,
} from '../constants/formSchema';
import { ItineraryColorField, ItineraryNameField } from './ItineraryFormFields';
import { TourFieldLanguageSwitch } from '@/tms/branch-detail/dashboard/_components/TourFieldLanguageSwitch';
import { useItineraryLanguage } from '../hooks/useItineraryLanguage';
import {
  buildTranslationsFromItinerary,
  sanitizeTranslations,
} from '../utils/translationHelpers';

const duplicateSuffix = ' (copy)';

const getPrimaryItineraryTranslation = (
  itinerary: IItinerary,
  primaryLanguage?: string,
) => itinerary.translations?.find((t) => t.language === primaryLanguage);

const getPrimaryGroupDays = (
  itinerary: IItinerary,
  primaryLanguage?: string,
) => {
  const primaryTranslation = getPrimaryItineraryTranslation(
    itinerary,
    primaryLanguage,
  );
  const primaryGroupDayMap = new Map(
    (primaryTranslation?.groupDays || []).map((groupDay) => [
      groupDay.day,
      groupDay,
    ]),
  );

  return itinerary.groupDays?.map((day) => {
    const translatedDay = day.day ? primaryGroupDayMap.get(day.day) : undefined;

    return {
      day: day.day,
      title: translatedDay?.title ?? day.title,
      content: translatedDay?.content ?? day.content,
      elements: day.elements?.map(({ __typename: _e, ...el }) => el),
      elementsQuick: day.elementsQuick?.map(({ __typename: _eq, ...el }) => el),
      images: day.images,
    };
  });
};

const buildDuplicateName = (value?: string) =>
  value ? `${value}${duplicateSuffix}` : '';

const buildDuplicateTranslationDefaults = (
  itinerary: IItinerary,
  translationLanguages: string[],
) =>
  (buildTranslationsFromItinerary(itinerary, translationLanguages) ?? []).map(
    (translation) => ({
      ...translation,
      name: buildDuplicateName(translation.name),
    }),
  );

interface ItineraryDuplicateSheetProps {
  itinerary: IItinerary;
  branchId?: string;
  branchLanguages?: string[];
  mainLanguage?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ItineraryDuplicateSheet = ({
  itinerary,
  branchId,
  branchLanguages,
  mainLanguage,
  open,
  onOpenChange,
}: ItineraryDuplicateSheetProps) => {
  const { createItinerary, loading } = useCreateItinerary();
  const { toast } = useToast();
  const { itinerary: detailItinerary, loading: detailLoading } =
    useItineraryDetail(itinerary._id, open);
  const sourceItinerary = detailItinerary || itinerary;
  const {
    allLanguages,
    translationLanguages,
    selectedLang,
    setSelectedLang,
    labelSuffix,
    fieldPaths,
  } = useItineraryLanguage({ branchLanguages, mainLanguage });
  const resolvedPrimaryLanguage =
    mainLanguage ?? sourceItinerary.language ?? allLanguages[0] ?? '';
  const primaryTranslation = getPrimaryItineraryTranslation(
    sourceItinerary,
    resolvedPrimaryLanguage,
  );
  const primaryName = primaryTranslation?.name || sourceItinerary.name || '';

  const form = useForm<ItineraryCreateFormType>({
    resolver: zodResolver(ItineraryCreateFormSchema),
    defaultValues: {
      name: buildDuplicateName(primaryName),
      color: itinerary.color || '#4F46E5',
      translations: buildDuplicateTranslationDefaults(
        sourceItinerary,
        translationLanguages,
      ),
    },
  });
  useFieldArray({
    control: form.control,
    name: 'translations',
  });

  const { reset } = form;

  useEffect(() => {
    if (open) {
      reset({
        name: buildDuplicateName(primaryName),
        color: sourceItinerary.color || '#4F46E5',
        translations: buildDuplicateTranslationDefaults(
          sourceItinerary,
          translationLanguages,
        ),
      });
      setSelectedLang(resolvedPrimaryLanguage);
    }
  }, [open, primaryName, reset, sourceItinerary, translationLanguages, setSelectedLang, resolvedPrimaryLanguage]);

  if (open && detailLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <Sheet.View className="w-[400px] sm:max-w-[400px] p-0">
          <Sheet.Header>
            <Sheet.Title>Duplicate itinerary</Sheet.Title>
          </Sheet.Header>
          <Sheet.Content className="flex items-center justify-center py-12">
            <Spinner />
          </Sheet.Content>
        </Sheet.View>
      </Sheet>
    );
  }

  const handleSubmit = async (values: ItineraryCreateFormType) => {
    const duplicateTranslations = sanitizeTranslations(values.translations);

    createItinerary({
      variables: {
        branchId: branchId || sourceItinerary.branchId,
        language: resolvedPrimaryLanguage || undefined,
        name: values.name,
        duration: sourceItinerary.duration,
        color: values.color,
        images: sourceItinerary.images,
        content: primaryTranslation?.content ?? sourceItinerary.content,
        totalCost: sourceItinerary.totalCost,
        guideCost: primaryTranslation?.guideCost ?? sourceItinerary.guideCost,
        driverCost:
          primaryTranslation?.driverCost ?? sourceItinerary.driverCost,
        foodCost: primaryTranslation?.foodCost ?? sourceItinerary.foodCost,
        gasCost: primaryTranslation?.gasCost ?? sourceItinerary.gasCost,
        personCost: sourceItinerary.personCost,
        guideCostExtra:
          primaryTranslation?.guideCostExtra ?? sourceItinerary.guideCostExtra,
        groupDays: getPrimaryGroupDays(
          sourceItinerary,
          resolvedPrimaryLanguage,
        ),
        translations: duplicateTranslations?.length
          ? duplicateTranslations
          : undefined,
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Itinerary duplicated successfully',
        });
        onOpenChange(false);
        form.reset();
      },
      onError: (e: unknown) => {
        toast({
          title: 'Error',
          description: e instanceof Error ? e.message : 'Failed to duplicate itinerary',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="w-[400px] sm:max-w-[400px] p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full"
          >
            <Sheet.Header>
              <Sheet.Title>Duplicate itinerary</Sheet.Title>
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
              <div className="flex flex-col gap-4">
                <ItineraryNameField
                  key={fieldPaths.name}
                  control={form.control}
                  name={fieldPaths.name}
                  labelSuffix={labelSuffix}
                />
                <ItineraryColorField control={form.control} />
              </div>
            </Sheet.Content>

            <Sheet.Footer className="bg-background">
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Duplicating...' : 'Duplicate'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
