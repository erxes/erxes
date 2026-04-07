import {
  Button,
  Collapsible,
  Form,
  Sheet,
  useToast,
  Tabs,
  Spinner,
} from 'erxes-ui';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronDown } from '@tabler/icons-react';

import {
  ItineraryCreateFormSchema,
  ItineraryCreateFormType,
} from '../constants/formSchema';

import {
  ItineraryNameField,
  ItineraryColorField,
  ItineraryContentField,
  ItineraryImageField,
  ItineraryGuideCostField,
  ItineraryDriverCostField,
  ItineraryFoodCostField,
  ItineraryGasCostField,
  ItineraryGuideCostExtraField,
  ItineraryPersonCostField,
} from './ItineraryFormFields';
import { TourFieldLanguageSwitch } from '@/tms/branch-detail/dashboard/_components/TourFieldLanguageSwitch';
import { useEditItinerary } from '../hooks/useEditItinerary';
import { useItineraryDetail } from '../hooks/useItineraryDetail';
import { useItineraryLanguage } from '../hooks/useItineraryLanguage';
import {
  buildTranslationsFromItinerary,
  sanitizeTranslations,
  resolveMainLanguageName,
} from '../utils/translationHelpers';
import { ItineraryBuilder } from '../itinerary-builder';
import { useElements } from '../../elements/hooks/useElements';
import { useAmenities } from '../../amenities/hooks/useAmenities';

const extractFirstError = (errors: Record<string, any>): string => {
  for (const value of Object.values(errors)) {
    if (value?.message && typeof value.message === 'string') {
      return value.message;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item) {
          const nested = extractFirstError(item);
          if (nested) return nested;
        }
      }
    }
    if (typeof value === 'object' && value !== null && !value.message) {
      const nested = extractFirstError(value);
      if (nested) return nested;
    }
  }
  return 'Please check the form for errors.';
};

interface ItineraryEditSheetProps {
  itineraryId?: string;
  branchId?: string;
  branchLanguages?: string[];
  mainLanguage?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type Step = 'build' | 'info';

export const ItineraryEditSheet = ({
  itineraryId,
  branchId,
  branchLanguages,
  mainLanguage,
  open,
  onOpenChange,
}: ItineraryEditSheetProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('build');
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  const { toast } = useToast();
  const { editItinerary, loading: editLoading } = useEditItinerary();
  const { itinerary, loading: detailLoading } = useItineraryDetail(
    itineraryId,
    open,
  );

  const form = useForm<ItineraryCreateFormType>({
    resolver: zodResolver(ItineraryCreateFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      color: '#4F46E5',
      content: '',
      duration: 1,
      images: [],
      totalCost: 0,
      groupDays: [],
      guideCost: 0,
      driverCost: 0,
      foodCost: 0,
      gasCost: 0,
      personCost: {},
      guideCostExtra: 0,
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
  } = useItineraryLanguage({ branchLanguages, mainLanguage });

  const { elements: elementsData = [] } = useElements({
    variables: {
      branchId,
      quick: false,
      language: selectedLang || mainLanguage,
    },
    skip: !branchId,
  });

  const { amenities: amenitiesData = [] } = useAmenities({
    variables: {
      branchId,
      quick: true,
      language: selectedLang || mainLanguage,
    },
    skip: !branchId,
  });

  const resolvedPrimaryLanguage = mainLanguage ?? allLanguages[0] ?? '';

  useEffect(() => {
    if (itinerary && open) {
      const transformedGroupDays = (itinerary.groupDays || []).map((day) => ({
        day: day.day,
        title: day.title || '',
        description: day.content || '',
        elements: (day.elements || []).map((el) => el.elementId || ''),
        amenities: (day.elementsQuick || []).map((el) => el.elementId || ''),
        images: day.images || [],
      }));

      form.reset({
        name: resolveMainLanguageName(itinerary as any, mainLanguage),
        color: itinerary.color || '#4F46E5',
        content: itinerary.content || '',
        duration: itinerary.duration || 1,
        images: itinerary.images || [],
        totalCost: itinerary.totalCost || 0,
        groupDays: transformedGroupDays,
        guideCost: itinerary.guideCost || 0,
        driverCost: itinerary.driverCost || 0,
        foodCost: itinerary.foodCost || 0,
        gasCost: itinerary.gasCost || 0,
        personCost: itinerary.personCost || {},
        guideCostExtra: itinerary.guideCostExtra || 0,
        translations: buildTranslationsFromItinerary(
          itinerary as any,
          translationLanguages,
        ),
      });
      setSelectedLang((prev) =>
        allLanguages.includes(prev) ? prev : resolvedPrimaryLanguage,
      );
    }
  }, [
    itinerary,
    open,
    form,
    translationLanguages,
    resolvedPrimaryLanguage,
    mainLanguage,
    allLanguages,
    setSelectedLang,
  ]);

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      form.reset();
      setCurrentStep('build');
      setShowMoreOptions(false);
    }
    onOpenChange?.(value);
  };

  const stepFields: Record<Step, (keyof ItineraryCreateFormType)[]> = {
    build: ['groupDays'],
    info: ['name'],
  };

  const handleNextStep = async () => {
    const fields = stepFields.build;
    const isValid = await form.trigger(fields);
    if (!isValid) return;
    form.clearErrors();
    setCurrentStep('info');
  };

  const onInvalid = (errors: Record<string, any>) => {
    const nameValue = form.getValues('name');
    if (!nameValue?.trim()) {
      toast({
        title: 'Error',
        description:
          'Please enter values for the main language before updating.',
        variant: 'destructive',
      });
      setSelectedLang(mainLanguage || allLanguages[0] || '');
      return;
    }

    const firstError = extractFirstError(errors);
    if (firstError) {
      toast({
        title: 'Validation Error',
        description: firstError,
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (values: ItineraryCreateFormType) => {
    if (!itineraryId) {
      toast({
        title: 'Error',
        description: 'Itinerary ID is required',
        variant: 'destructive',
      });
      return;
    }

    if (!values.groupDays || values.groupDays.length === 0) {
      toast({
        title: 'Error',
        description: 'At least one day is required',
        variant: 'destructive',
      });
      return;
    }

    const transformedGroupDays = values.groupDays.map((day, index) => ({
      day: index + 1,
      title: day.title,
      content: day.description,
      elements: (day.elements || []).map((elementId, order) => ({
        elementId,
        orderOfDay: order + 1,
      })),
      elementsQuick: (day.amenities || []).map((amenityId, order) => ({
        elementId: amenityId,
        orderOfDay: order + 1,
      })),
      images: day.images || [],
    }));

    const totalDays = values.groupDays.length;

    const totalCost = values.groupDays.reduce((sum, day) => {
      const dayCost = (day.elements || []).reduce((daySum, elementId) => {
        const element = elementsData.find(
          (el: { _id: string; cost?: number }) => el._id === elementId,
        );
        return daySum + (element?.cost || 0);
      }, 0);
      return sum + dayCost;
    }, 0);

    const normalizedPersonCost = Object.entries(values.personCost || {}).reduce<
      Record<string, number>
    >((acc, [key, value]) => {
      if (typeof value === 'number' && !Number.isNaN(value)) {
        acc[key] = value;
      }

      return acc;
    }, {});

    try {
      await editItinerary({
        variables: {
          id: itineraryId,
          branchId,
          name: values.name,
          color: values.color,
          content: values.content,
          duration: totalDays,
          images: values.images?.slice(0, 1) || [],
          totalCost,
          groupDays: transformedGroupDays,
          guideCost: values.guideCost,
          driverCost: values.driverCost,
          foodCost: values.foodCost,
          gasCost: values.gasCost,
          personCost: normalizedPersonCost,
          guideCostExtra: values.guideCostExtra,
          translations: sanitizeTranslations(values.translations),
        },
      });

      toast({
        title: 'Success',
        description: 'Itinerary updated successfully',
      });

      handleOpenChange(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update itinerary';

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const sheetWidth =
    currentStep === 'info'
      ? 'w-[600px] sm:max-w-[600px]'
      : 'w-[1200px] sm:max-w-[1200px]';

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <Sheet.View
        className={`p-0 transition-all duration-300 ease-in-out ${sheetWidth}`}
      >
        {detailLoading ? (
          <div className="flex h-full min-h-[400px] items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit, onInvalid)}
              className="flex flex-col h-full"
            >
              <Sheet.Header>
                <Sheet.Title>Edit itinerary</Sheet.Title>
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

              <Sheet.Content className="flex-1 p-0 overflow-hidden">
                <Tabs value={currentStep} className="flex flex-col h-full">
                  <Tabs.Content
                    value="build"
                    className="flex-1 p-3 overflow-hidden"
                  >
                    <ItineraryBuilder
                      key={selectedLang}
                      control={form.control}
                      setValue={form.setValue}
                      watch={form.watch}
                      elements={elementsData}
                      amenities={amenitiesData}
                      branchId={branchId}
                      isEditMode={true}
                      labelSuffix={labelSuffix}
                      currencySymbol={currencySymbol}
                      mainLanguage={mainLanguage}
                      branchLanguages={branchLanguages}
                      daysFieldPathPrefix={fieldPaths.daysFieldPathPrefix}
                      dayDescriptionKey={fieldPaths.dayDescriptionKey}
                    />
                  </Tabs.Content>

                  <Tabs.Content value="info" className="p-6 overflow-y-auto">
                    <div key={selectedLang} className="w-full space-y-4">
                      <div className="flex items-end gap-4">
                        <div className="w-[20%]">
                          <ItineraryColorField control={form.control} />
                        </div>
                        <div className="w-[80%]">
                          <ItineraryNameField
                            control={form.control}
                            name={fieldPaths.name}
                            labelSuffix={labelSuffix}
                          />
                        </div>
                      </div>

                      <ItineraryContentField
                        control={form.control}
                        name={fieldPaths.content}
                        labelSuffix={labelSuffix}
                      />

                      <ItineraryImageField control={form.control} />

                      <Collapsible
                        open={showMoreOptions}
                        onOpenChange={setShowMoreOptions}
                        className="flex flex-col items-center my-5"
                      >
                        <Collapsible.Content className="order-1 w-full pt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <ItineraryGuideCostField
                              control={form.control}
                              name={fieldPaths.guideCost}
                              currencySymbol={currencySymbol}
                            />
                            <ItineraryDriverCostField
                              control={form.control}
                              name={fieldPaths.driverCost}
                              currencySymbol={currencySymbol}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <ItineraryFoodCostField
                              control={form.control}
                              name={fieldPaths.foodCost}
                              currencySymbol={currencySymbol}
                            />
                            <ItineraryGasCostField
                              control={form.control}
                              name={fieldPaths.gasCost}
                              currencySymbol={currencySymbol}
                            />
                          </div>

                          <ItineraryGuideCostExtraField
                            control={form.control}
                            name={fieldPaths.guideCostExtra}
                            currencySymbol={currencySymbol}
                          />

                          <ItineraryPersonCostField
                            control={form.control}
                            duration={form.watch('groupDays')?.length || 1}
                          />
                        </Collapsible.Content>

                        <Collapsible.Trigger asChild>
                          <Button
                            type="button"
                            variant="secondary"
                            className="group"
                            size="sm"
                          >
                            {showMoreOptions
                              ? 'Hide more options'
                              : 'Show more options'}
                            <IconChevronDown
                              size={12}
                              strokeWidth={2}
                              className={`transition-transform ${
                                showMoreOptions ? 'rotate-180' : ''
                              }`}
                            />
                          </Button>
                        </Collapsible.Trigger>
                      </Collapsible>
                    </div>
                  </Tabs.Content>
                </Tabs>
              </Sheet.Content>

              <Sheet.Footer className="bg-background">
                {currentStep === 'build' ? (
                  <div key="build-actions" className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOpenChange(false)}
                      disabled={editLoading}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      disabled={editLoading}
                      onClick={handleNextStep}
                    >
                      Next
                    </Button>
                  </div>
                ) : (
                  <div key="info-actions" className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        form.clearErrors();
                        setCurrentStep('build');
                      }}
                      disabled={editLoading}
                    >
                      Back
                    </Button>

                    <Button type="submit" disabled={editLoading}>
                      {editLoading ? 'Updating...' : 'Update'}
                    </Button>
                  </div>
                )}
              </Sheet.Footer>
            </form>
          </Form>
        )}
      </Sheet.View>
    </Sheet>
  );
};
