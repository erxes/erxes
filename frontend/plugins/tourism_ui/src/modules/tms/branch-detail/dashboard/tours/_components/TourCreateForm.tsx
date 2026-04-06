import { Form, Sheet, Button, Tabs, useToast } from 'erxes-ui';
import { useForm, useWatch, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';
import { nanoid } from 'nanoid';

import { GET_ITINERARIES } from '../../itinerary/graphql/queries';
import { useCreateTour } from '../hooks/useCreateTour';
import { useTourLanguage } from '../hooks/useTourLanguage';
import { TourFieldLanguageSwitch } from '../../_components/TourFieldLanguageSwitch';
import {
  buildEmptyTourTranslations,
  sanitizeTourTranslations,
  syncTranslationPricingOptions,
} from '../utils/translationHelpers';

import {
  TourCreateFormSchema,
  TourCreateFormType,
} from '../constants/formSchema';

import {
  TourDescriptionField,
  TourNameField,
  TourRefNumberField,
  TourStatusField,
  TourDurationField,
  TourGroupSizeField,
  TourInfo1Field,
  TourInfo2Field,
  TourInfo3Field,
  TourInfo4Field,
  TourInfo5Field,
  TourAdvanceCheckField,
  TourAdvancePercentField,
  TourJoinPercentField,
  TourItineraryIdField,
  TourCategoryField,
  TourImageThumbnailField,
  TourImagesField,
  TourAttachmentsField,
  TourDateSchedulingField,
  TourPricingOptionsField,
} from './TourFormFields';

interface Props {
  branchId?: string;
  branchLanguages?: string[];
  mainLanguage?: string;
  onSuccess?: () => void;
}

interface Itinerary {
  _id: string;
  duration?: number;
}

const hideFields = false;

const sortDates = (dates: Date[]) =>
  [...dates].sort((a, b) => a.getTime() - b.getTime());

const calculateEndDate = (startDate: Date, duration?: number) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Number(duration || 0));

  return endDate;
};

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const getDateStatus = (
  startDate?: Date,
): 'scheduled' | 'unscheduled' | 'running' => {
  if (!startDate) {
    return 'unscheduled';
  }

  return isSameDay(startDate, new Date()) ? 'running' : 'scheduled';
};

export const TourCreateForm = ({ branchId, branchLanguages, mainLanguage, onSuccess }: Props) => {
  const { toast } = useToast();
  const { createTour, loading } = useCreateTour();

  const form = useForm<TourCreateFormType>({
    resolver: zodResolver(TourCreateFormSchema),
    defaultValues: {
      name: '',
      refNumber: '',
      status: 'draft',
      content: '',
      itineraryId: '',
      categoryIds: [],
      duration: 0,
      groupSize: 0,
      isFlexibleDate: false,
      isGroupTour: false,
      advanceCheck: false,
      advancePercent: 0,
      joinPercent: 0,
      info1: '',
      info2: '',
      info3: '',
      info4: '',
      info5: '',
      images: [],
      imageThumbnail: '',
      attachment: null,
      guides: [],
      pricingOptions: [
        {
          _id: nanoid(8),
          title: '',
          minPersons: 1,
          maxPersons: undefined,
          pricePerPerson: 0,
          accommodationType: '',
          domesticFlightPerPerson: undefined,
          singleSupplement: undefined,
          note: '',
        },
      ],
      translations: [],
    },
  });

  const { fields: translationFields } = useFieldArray({
    control: form.control,
    name: 'translations',
  });

  const {
    allLanguages,
    translationLanguages,
    selectedLang,
    setSelectedLang,
    isMainLang,
    translationIndex,
    labelSuffix,
    fieldPaths,
  } = useTourLanguage({ branchLanguages, mainLanguage, fields: translationFields });

  const resolvedPrimaryLanguage = mainLanguage ?? allLanguages[0] ?? '';

  useEffect(() => {
    if (!translationLanguages.length) return;
    const current = form.getValues('translations') || [];
    const currentLangs = current.map((t) => t.language);
    const pricingOptionIds = (form.getValues('pricingOptions') || []).map((p) => p._id);
    if (!translationLanguages.every((l) => currentLangs.includes(l))) {
      form.setValue(
        'translations',
        buildEmptyTourTranslations(translationLanguages, pricingOptionIds),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationLanguages.join(',')]);

  const watchedPricingOptions = useWatch({
    control: form.control,
    name: 'pricingOptions',
  });

  useEffect(() => {
    if (!translationLanguages.length) return;
    const pricingOptionIds = (watchedPricingOptions || []).map((p) => p._id).filter(Boolean);
    if (!pricingOptionIds.length) return;
    const current = form.getValues('translations');
    const synced = syncTranslationPricingOptions(current, pricingOptionIds);
    if (synced !== current) {
      form.setValue('translations', synced || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedPricingOptions?.map((p) => p._id).join(','), translationLanguages.join(',')]);

  const itineraryId = useWatch({
    control: form.control,
    name: 'itineraryId',
  });

  const startDate = useWatch({
    control: form.control,
    name: 'startDate',
  });

  const duration = useWatch({
    control: form.control,
    name: 'duration',
  });

  const { data } = useQuery(GET_ITINERARIES, {
    variables: { branchId, limit: 100, orderBy: { createdAt: -1 } },
    skip: !branchId,
  });

  const itineraries: Itinerary[] = useMemo(() => {
    return data?.bmsItineraries?.list ?? [];
  }, [data]);

  const selectedItinerary = useMemo(() => {
    return itineraries.find((it) => it._id === itineraryId);
  }, [itineraryId, itineraries]);

  useEffect(() => {
    if (selectedItinerary?.duration) {
      form.setValue('duration', selectedItinerary.duration);
    }
  }, [selectedItinerary, form]);

  useEffect(() => {
    if (!startDate || !duration) {
      form.setValue('endDate', undefined);
      return;
    }

    const selectedStartDate = Array.isArray(startDate)
      ? sortDates(startDate)[0]
      : startDate;

    if (!selectedStartDate) {
      form.setValue('endDate', undefined);
      return;
    }

    form.setValue('endDate', calculateEndDate(selectedStartDate, duration));
  }, [startDate, duration, form]);

  const handleSubmit = async (values: TourCreateFormType) => {
    if (!branchId) {
      toast({
        title: 'Error',
        description: 'Branch required',
        variant: 'destructive',
      });
      return;
    }

    if (!values.pricingOptions || values.pricingOptions.length === 0) {
      toast({
        title: 'Error',
        description: 'At least one pricing option is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const {
        startDate: _startDate,
        endDate: _endDate,
        availableFrom: _availableFrom,
        availableTo: _availableTo,
        isFlexibleDate: _isFlexibleDate,
        isGroupTour: _isGroupTour,
        pricingOptions,
        translations,
        ...restValues
      } = values;

      const isFlexible = values.isFlexibleDate;

      const normalizedPricingOptions = pricingOptions.map((opt) => ({
        ...opt,
        accommodationType: opt.accommodationType
          ? opt.accommodationType.trim().toLowerCase()
          : opt.accommodationType,
      }));

      const sanitizedTranslations = sanitizeTourTranslations(translations);

      const groupCode = nanoid(8);

      if (isFlexible) {
        await createTour({
          variables: {
            branchId,
            ...restValues,
            pricingOptions: normalizedPricingOptions,
            dateType: 'flexible',
            availableFrom: values.availableFrom,
            availableTo: values.availableTo,
            startDate: undefined,
            endDate: undefined,
            date_status: 'unscheduled',
            groupCode,
            translations: sanitizedTranslations,
          },
        });
      } else {
        const normalizedStartDates = values.startDate
          ? Array.isArray(values.startDate)
            ? sortDates(values.startDate)
            : [values.startDate]
          : [];

        const selectedDates = values.isGroupTour
          ? normalizedStartDates
          : normalizedStartDates.slice(0, 1);

        const primaryStartDate = selectedDates[0];

        if (selectedDates.length > 0) {
          const isMulti = values.isGroupTour && selectedDates.length > 1;

          await Promise.all(
            selectedDates.map((selectedDate, idx) => {
              const computedEndDate = calculateEndDate(
                selectedDate,
                values.duration,
              );

              const refNumber = isMulti
                ? `${restValues.refNumber}-${String(idx + 1).padStart(2, '0')}`
                : restValues.refNumber;

              return createTour({
                variables: {
                  branchId,
                  ...restValues,
                  refNumber,
                  pricingOptions: normalizedPricingOptions,
                  dateType: 'fixed',
                  startDate: selectedDate,
                  endDate: computedEndDate,
                  availableFrom: undefined,
                  availableTo: undefined,
                  date_status: getDateStatus(selectedDate),
                  groupCode,
                  translations: sanitizedTranslations,
                },
              });
            }),
          );
        } else {
          const computedEndDate = primaryStartDate
            ? calculateEndDate(primaryStartDate, values.duration)
            : undefined;

          await createTour({
            variables: {
              branchId,
              ...restValues,
              pricingOptions: normalizedPricingOptions,
              dateType: 'fixed',
              startDate: primaryStartDate,
              endDate: computedEndDate,
              availableFrom: undefined,
              availableTo: undefined,
              date_status: getDateStatus(primaryStartDate),
              groupCode,
              translations: sanitizedTranslations,
            },
          });
        }
      }

      toast({
        title: 'Success',
        description: 'Tour created successfully',
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create tour',
        variant: 'destructive',
      });
    }
  };

  const onInvalid = () => {
    const nameValue = form.getValues('name');
    if (!nameValue?.trim()) {
      toast({
        title: 'Error',
        description:
          'Please enter values for the main language before creating.',
        variant: 'destructive',
      });
      setSelectedLang(resolvedPrimaryLanguage);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, onInvalid)}
        className="flex flex-col h-full"
      >
        <Sheet.Header>
          <Sheet.Title>Create tour</Sheet.Title>
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
              <div className="grid grid-cols-2 gap-4">
                <TourNameField control={form.control} name={fieldPaths.name} labelSuffix={labelSuffix} />
                <TourRefNumberField control={form.control} name={fieldPaths.refNumber} labelSuffix={labelSuffix} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TourStatusField control={form.control} />
                <TourItineraryIdField
                  control={form.control}
                  branchId={branchId}
                  language={selectedLang}
                />
              </div>

              <TourCategoryField control={form.control} branchId={branchId} language={selectedLang} />

              <TourDescriptionField control={form.control} name={fieldPaths.content} labelSuffix={labelSuffix} />
            </div>

            <div className="flex items-center">
              <div className="flex-1 border-t" />
              <Form.Label className="mx-2">Duration Info</Form.Label>
              <div className="flex-1 border-t" />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <TourDurationField control={form.control} />
                <TourGroupSizeField control={form.control} />
              </div>

              <TourDateSchedulingField
                control={form.control}
                setValue={form.setValue}
              />
            </div>

            <div className="flex items-center">
              <div className="flex-1 border-t" />
              <Form.Label className="mx-2">Pricing Info</Form.Label>
              <div className="flex-1 border-t" />
            </div>

            <TourPricingOptionsField control={form.control} translationIndex={isMainLang ? undefined : translationIndex} labelSuffix={labelSuffix} />

            {hideFields && (
              <div className="pt-4 space-y-4 border-t">
                <TourAdvanceCheckField control={form.control} />

                <div className="grid grid-cols-2 gap-4">
                  <TourAdvancePercentField control={form.control} />
                  <TourJoinPercentField control={form.control} />
                </div>
              </div>
            )}

            <div className="flex items-center">
              <div className="flex-1 border-t" />
              <Form.Label className="mx-2">More Info</Form.Label>
              <div className="flex-1 border-t" />
            </div>

            <div className="space-y-4">
              <TourImageThumbnailField control={form.control} />
              <TourImagesField control={form.control} />
              <TourAttachmentsField control={form.control} />
            </div>

            <div className="pt-4 space-y-4">
              <Tabs defaultValue="info1" className="w-full">
                <Tabs.List className="grid w-full grid-cols-5">
                  <Tabs.Trigger value="info1">Included</Tabs.Trigger>
                  <Tabs.Trigger value="info2">Not Included</Tabs.Trigger>
                  <Tabs.Trigger value="info3">Highlights</Tabs.Trigger>
                  <Tabs.Trigger value="info4">
                    Additional Information
                  </Tabs.Trigger>
                  <Tabs.Trigger value="info5">Notes</Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="info1" className="pt-4">
                  <TourInfo1Field control={form.control} name={fieldPaths.info1} />
                </Tabs.Content>

                <Tabs.Content value="info2" className="pt-4">
                  <TourInfo2Field control={form.control} name={fieldPaths.info2} />
                </Tabs.Content>

                <Tabs.Content value="info3" className="pt-4">
                  <TourInfo3Field control={form.control} name={fieldPaths.info3} />
                </Tabs.Content>

                <Tabs.Content value="info4" className="pt-4">
                  <TourInfo4Field control={form.control} name={fieldPaths.info4} />
                </Tabs.Content>

                <Tabs.Content value="info5" className="pt-4">
                  <TourInfo5Field control={form.control} name={fieldPaths.info5} />
                </Tabs.Content>
              </Tabs>
            </div>
          </div>
        </Sheet.Content>

        <Sheet.Footer className="bg-background">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onSuccess}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
