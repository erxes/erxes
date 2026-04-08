import { useEffect, useMemo } from 'react';
import { Button, Form, Input, Sheet, Spinner, useToast } from 'erxes-ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { useCreateTour } from '../hooks/useCreateTour';
import { useTourDetail, ITourDetail } from '../hooks/useTourDetail';
import { RHFDatePicker } from './RHFDatePicker';
import { TourFieldLanguageSwitch } from '../../_components/TourFieldLanguageSwitch';
import { useTourLanguage } from '../hooks/useTourLanguage';
import {
  TourTranslationSchema,
  TourTranslationFormValue,
} from '../constants/formSchema';
import {
  buildTranslationsFromTour,
  sanitizeTourTranslations,
} from '../utils/translationHelpers';

const stripTypename = <T extends Record<string, any>>(
  obj: T,
): Omit<T, '__typename'> => {
  const { __typename, ...rest } = obj as any;
  return rest;
};

const duplicateNameSuffix = ' (copy)';
const duplicateRefNumberSuffix = '-copy';

const getPrimaryTourTranslation = (tour: ITourDetail, primaryLanguage: string) =>
  tour.translations?.find(
    (translation) => translation.language === primaryLanguage,
  );

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

const calculateEndDate = (startDate: Date, duration?: number) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Number(duration || 0));
  return endDate;
};

const FixedFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  refNumber: z.string().min(1, 'Ref number is required'),
  startDate: z.coerce.date({ required_error: 'Start date is required' }),
  translations: z.array(TourTranslationSchema).optional(),
});

const FlexibleFormSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    refNumber: z.string().min(1, 'Ref number is required'),
    availableFrom: z.coerce.date({
      required_error: 'Available from is required',
    }),
    availableTo: z.coerce.date({ required_error: 'Available to is required' }),
    translations: z.array(TourTranslationSchema).optional(),
  })
  .refine((data) => data.availableFrom < data.availableTo, {
    message: 'Available from must be before available to',
    path: ['availableTo'],
  });

type FixedFormType = Omit<z.infer<typeof FixedFormSchema>, 'translations'> & {
  translations?: TourTranslationFormValue[];
};
type FlexibleFormType = Omit<
  z.infer<typeof FlexibleFormSchema>,
  'translations'
> & {
  translations?: TourTranslationFormValue[];
};

interface TourDuplicateSheetProps {
  tourId: string;
  dateType?: 'fixed' | 'flexible';
  branchId?: string;
  branchLanguages?: string[];
  mainLanguage?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TourDuplicateSheet = ({
  tourId,
  dateType,
  branchId,
  branchLanguages,
  mainLanguage,
  open,
  onOpenChange,
}: TourDuplicateSheetProps) => {
  const { tourDetail, loading: detailLoading } = useTourDetail({
    variables: { id: tourId },
    skip: !open,
  });

  if (!open) return null;

  if (detailLoading || !tourDetail) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <Sheet.View className="w-[400px] sm:max-w-[400px] p-0">
          <Sheet.Header>
            <Sheet.Title>Duplicate tour</Sheet.Title>
          </Sheet.Header>
          <Sheet.Content className="flex items-center justify-center py-12">
            <Spinner />
          </Sheet.Content>
        </Sheet.View>
      </Sheet>
    );
  }

  const resolvedDateType = tourDetail.dateType ?? dateType;
  const isFlexible = resolvedDateType === 'flexible';

  return isFlexible ? (
    <FlexibleDuplicateSheet
      tour={tourDetail}
      branchId={branchId}
      branchLanguages={branchLanguages}
      mainLanguage={mainLanguage}
      open={open}
      onOpenChange={onOpenChange}
    />
  ) : (
    <FixedDuplicateSheet
      tour={tourDetail}
      branchId={branchId}
      branchLanguages={branchLanguages}
      mainLanguage={mainLanguage}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
};

interface InnerSheetProps {
  tour: ITourDetail;
  branchId?: string;
  branchLanguages?: string[];
  mainLanguage?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const buildDuplicateTranslations = (
  tour: ITourDetail,
  translationLanguages: string[],
): TourTranslationFormValue[] =>
  buildTranslationsFromTour(tour, translationLanguages).map((translation) => ({
    ...translation,
    name: translation.name
      ? `${translation.name}${duplicateNameSuffix}`
      : translation.name,
    refNumber: translation.refNumber
      ? `${translation.refNumber}${duplicateRefNumberSuffix}`
      : translation.refNumber,
  }));

const FixedDuplicateSheet = ({
  tour,
  branchId,
  branchLanguages,
  mainLanguage,
  open,
  onOpenChange,
}: InnerSheetProps) => {
  const { createTour, loading } = useCreateTour();
  const { toast } = useToast();
  const today = useMemo(() => new Date(), []);
  const {
    allLanguages,
    translationLanguages,
    selectedLang,
    setSelectedLang,
    fieldPaths,
  } = useTourLanguage({ branchLanguages, mainLanguage });
  const resolvedPrimaryLanguage =
    mainLanguage ?? tour.language ?? allLanguages[0] ?? '';
  const primaryTranslation = getPrimaryTourTranslation(tour, resolvedPrimaryLanguage);
  const normalizedPricingOptions = useMemo(
    () =>
      (tour.pricingOptions ?? []).map((opt) => ({
        ...stripTypename(opt),
        _id: opt._id || nanoid(8),
      })),
    [tour.pricingOptions],
  );
  const duplicateTranslations = useMemo(
    () =>
      buildDuplicateTranslations(
        { ...tour, pricingOptions: normalizedPricingOptions },
        translationLanguages,
      ),
    [tour, normalizedPricingOptions, translationLanguages],
  );

  const form = useForm<FixedFormType>({
    resolver: zodResolver(FixedFormSchema),
    defaultValues: {
      name: `${primaryTranslation?.name || tour.name || ''}${duplicateNameSuffix}`,
      refNumber: `${primaryTranslation?.refNumber || tour.refNumber || ''}${duplicateRefNumberSuffix}`,
      startDate: tour.startDate ? new Date(tour.startDate) : undefined,
      translations: duplicateTranslations,
    },
  });
  useFieldArray({
    control: form.control,
    name: 'translations',
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      name: `${primaryTranslation?.name || tour.name || ''}${duplicateNameSuffix}`,
      refNumber: `${primaryTranslation?.refNumber || tour.refNumber || ''}${duplicateRefNumberSuffix}`,
      startDate: tour.startDate ? new Date(tour.startDate) : undefined,
      translations: duplicateTranslations,
    });
    setSelectedLang(resolvedPrimaryLanguage);
  }, [
    open,
    form,
    primaryTranslation,
    tour,
    duplicateTranslations,
    resolvedPrimaryLanguage,
    setSelectedLang,
  ]);

  const handleSubmit = async (values: FixedFormType) => {
    if (!branchId) {
      toast({
        title: 'Error',
        description: 'Branch not selected — cannot duplicate tour',
        variant: 'destructive',
      });
      return;
    }
    const computedEndDate = calculateEndDate(values.startDate, tour.duration);
    const groupCode = nanoid(8);

    createTour({
      variables: {
        branchId,
        groupCode,
        name: values.name,
        refNumber: values.refNumber,
        language: resolvedPrimaryLanguage || undefined,
        date_status: getDateStatus(values.startDate),
        status: tour.status,
        dateType: 'fixed',
        startDate: values.startDate,
        endDate: computedEndDate,
        availableFrom: undefined,
        availableTo: undefined,
        cost: tour.cost,
        categoryIds: tour.categoryIds,
        content: primaryTranslation?.content ?? tour.content,
        itineraryId: tour.itineraryId,
        imageThumbnail: tour.imageThumbnail,
        images: tour.images,
        attachment: tour.attachment
          ? stripTypename(tour.attachment)
          : tour.attachment,
        duration: tour.duration,
        groupSize: tour.groupSize,
        advancePercent: tour.advancePercent,
        advanceCheck: tour.advanceCheck,
        joinPercent: tour.joinPercent,
        info1: primaryTranslation?.info1 ?? tour.info1,
        info2: primaryTranslation?.info2 ?? tour.info2,
        info3: primaryTranslation?.info3 ?? tour.info3,
        info4: primaryTranslation?.info4 ?? tour.info4,
        info5: primaryTranslation?.info5 ?? tour.info5,
        personCost: tour.personCost,
        pricingOptions: normalizedPricingOptions,
        translations: sanitizeTourTranslations(values.translations),
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Tour duplicated successfully',
        });
        onOpenChange(false);
        form.reset();
      },
      onError: (e: unknown) => {
        toast({
          title: 'Error',
          description: e instanceof Error ? e.message : 'Failed to duplicate tour',
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
              <Sheet.Title>Duplicate tour</Sheet.Title>
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
                <Form.Field
                  key={fieldPaths.name}
                  control={form.control}
                  name={fieldPaths.name}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Name</Form.Label>
                      <Form.Control>
                        <Input placeholder="Enter name" {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  key={fieldPaths.refNumber}
                  control={form.control}
                  name={fieldPaths.refNumber}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Ref number</Form.Label>
                      <Form.Control>
                        <Input placeholder="Enter ref number" {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={form.control}
                  name="startDate"
                  render={() => (
                    <Form.Item>
                      <Form.Label>Start date</Form.Label>
                      <Form.Control>
                        <RHFDatePicker
                          control={form.control}
                          name="startDate"
                          fromDate={today}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
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

const FlexibleDuplicateSheet = ({
  tour,
  branchId,
  branchLanguages,
  mainLanguage,
  open,
  onOpenChange,
}: InnerSheetProps) => {
  const { createTour, loading } = useCreateTour();
  const { toast } = useToast();
  const today = useMemo(() => new Date(), []);
  const {
    allLanguages,
    translationLanguages,
    selectedLang,
    setSelectedLang,
    fieldPaths,
  } = useTourLanguage({ branchLanguages, mainLanguage });
  const resolvedPrimaryLanguage =
    mainLanguage ?? tour.language ?? allLanguages[0] ?? '';
  const primaryTranslation = getPrimaryTourTranslation(tour, resolvedPrimaryLanguage);
  const normalizedPricingOptions = useMemo(
    () =>
      (tour.pricingOptions ?? []).map((opt) => ({
        ...stripTypename(opt),
        _id: opt._id || nanoid(8),
      })),
    [tour.pricingOptions],
  );
  const duplicateTranslations = useMemo(
    () =>
      buildDuplicateTranslations(
        { ...tour, pricingOptions: normalizedPricingOptions },
        translationLanguages,
      ),
    [tour, normalizedPricingOptions, translationLanguages],
  );

  const form = useForm<FlexibleFormType>({
    resolver: zodResolver(FlexibleFormSchema),
    defaultValues: {
      name: `${primaryTranslation?.name || tour.name || ''}${duplicateNameSuffix}`,
      refNumber: `${primaryTranslation?.refNumber || tour.refNumber || ''}${duplicateRefNumberSuffix}`,
      availableFrom: tour.availableFrom
        ? new Date(tour.availableFrom)
        : undefined,
      availableTo: tour.availableTo ? new Date(tour.availableTo) : undefined,
      translations: duplicateTranslations,
    },
  });
  useFieldArray({
    control: form.control,
    name: 'translations',
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      name: `${primaryTranslation?.name || tour.name || ''}${duplicateNameSuffix}`,
      refNumber: `${primaryTranslation?.refNumber || tour.refNumber || ''}${duplicateRefNumberSuffix}`,
      availableFrom: tour.availableFrom
        ? new Date(tour.availableFrom)
        : undefined,
      availableTo: tour.availableTo ? new Date(tour.availableTo) : undefined,
      translations: duplicateTranslations,
    });
    setSelectedLang(resolvedPrimaryLanguage);
  }, [
    open,
    form,
    primaryTranslation,
    tour,
    duplicateTranslations,
    resolvedPrimaryLanguage,
    setSelectedLang,
  ]);

  const handleSubmit = async (values: FlexibleFormType) => {
    if (!branchId) {
      toast({
        title: 'Error',
        description: 'Branch not selected — cannot duplicate tour',
        variant: 'destructive',
      });
      return;
    }
    const groupCode = nanoid(8);

    createTour({
      variables: {
        branchId,
        groupCode,
        name: values.name,
        refNumber: values.refNumber,
        language: resolvedPrimaryLanguage || undefined,
        date_status: 'unscheduled',
        status: tour.status,
        dateType: 'flexible',
        startDate: undefined,
        endDate: undefined,
        availableFrom: values.availableFrom,
        availableTo: values.availableTo,
        cost: tour.cost,
        categoryIds: tour.categoryIds,
        content: primaryTranslation?.content ?? tour.content,
        itineraryId: tour.itineraryId,
        imageThumbnail: tour.imageThumbnail,
        images: tour.images,
        attachment: tour.attachment
          ? stripTypename(tour.attachment)
          : tour.attachment,
        duration: tour.duration,
        groupSize: tour.groupSize,
        advancePercent: tour.advancePercent,
        advanceCheck: tour.advanceCheck,
        joinPercent: tour.joinPercent,
        info1: primaryTranslation?.info1 ?? tour.info1,
        info2: primaryTranslation?.info2 ?? tour.info2,
        info3: primaryTranslation?.info3 ?? tour.info3,
        info4: primaryTranslation?.info4 ?? tour.info4,
        info5: primaryTranslation?.info5 ?? tour.info5,
        personCost: tour.personCost,
        pricingOptions: normalizedPricingOptions,
        translations: sanitizeTourTranslations(values.translations),
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Tour duplicated successfully',
        });
        onOpenChange(false);
        form.reset();
      },
      onError: (e: unknown) => {
        toast({
          title: 'Error',
          description: e instanceof Error ? e.message : 'Failed to duplicate tour',
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
              <Sheet.Title>Duplicate tour</Sheet.Title>
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
                <Form.Field
                  key={fieldPaths.name}
                  control={form.control}
                  name={fieldPaths.name}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Name</Form.Label>
                      <Form.Control>
                        <Input placeholder="Enter name" {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  key={fieldPaths.refNumber}
                  control={form.control}
                  name={fieldPaths.refNumber}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Ref number</Form.Label>
                      <Form.Control>
                        <Input placeholder="Enter ref number" {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={form.control}
                  name="availableFrom"
                  render={() => (
                    <Form.Item>
                      <Form.Label>Available from</Form.Label>
                      <Form.Control>
                        <RHFDatePicker
                          control={form.control}
                          name="availableFrom"
                          fromDate={today}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={form.control}
                  name="availableTo"
                  render={() => (
                    <Form.Item>
                      <Form.Label>Available to</Form.Label>
                      <Form.Control>
                        <RHFDatePicker
                          control={form.control}
                          name="availableTo"
                          fromDate={today}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
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
