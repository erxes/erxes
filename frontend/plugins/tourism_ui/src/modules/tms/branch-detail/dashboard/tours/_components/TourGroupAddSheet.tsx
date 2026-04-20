import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { Button, Form, Input, Sheet, Spinner, useToast } from 'erxes-ui';
import { useCreateTour } from '../hooks/useCreateTour';
import { ITourDetail, useTourDetail } from '../hooks/useTourDetail';
import { useTourLanguage } from '../hooks/useTourLanguage';
import { TourFieldLanguageSwitch } from '../../_components/TourFieldLanguageSwitch';
import {
  TourTranslationFormValue,
  TourTranslationSchema,
} from '../constants/formSchema';
import {
  buildTranslationsFromTour,
  sanitizeTourTranslations,
} from '../utils/translationHelpers';
import { sanitizePricingOptionForSubmit } from '../utils/pricing';
import { RHFDatePicker } from './RHFDatePicker';

const GroupTourAddSchema = z.object({
  refNumber: z.string().min(1, 'Ref number is required'),
  startDate: z.coerce.date({ required_error: 'Start date is required' }),
  endDate: z.coerce.date().optional(),
  translations: z.array(TourTranslationSchema).optional(),
});

type GroupTourAddFormValues = Omit<
  z.infer<typeof GroupTourAddSchema>,
  'translations'
> & {
  translations?: TourTranslationFormValue[];
};

interface TourGroupAddSheetProps {
  templateTourId: string;
  groupCode: string;
  branchId?: string;
  branchLanguages?: string[];
  mainLanguage?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const stripTypename = <T extends object>(obj: T): Omit<T, '__typename'> => {
  const rest = { ...(obj as T & { __typename?: unknown }) };
  delete rest.__typename;
  return rest;
};

const getPrimaryTourTranslation = (
  tour: ITourDetail,
  primaryLanguage: string,
) =>
  tour.translations?.find(
    (translation) => translation.language === primaryLanguage,
  );

const getDateStatus = (
  startDate?: Date,
): 'scheduled' | 'unscheduled' | 'running' => {
  if (!startDate) {
    return 'unscheduled';
  }

  const today = new Date();
  const sameDay =
    startDate.getFullYear() === today.getFullYear() &&
    startDate.getMonth() === today.getMonth() &&
    startDate.getDate() === today.getDate();

  return sameDay ? 'running' : 'scheduled';
};

const calculateDuration = (startDate: Date, endDate: Date) => {
  const start = new Date(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate(),
  );
  const end = new Date(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate(),
  );

  return Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );
};

const calculateEndDate = (startDate: Date, duration?: number) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + Number(duration || 0));
  return endDate;
};

const resolveTemplateDuration = (tour?: ITourDetail) => {
  if (!tour) {
    return 0;
  }

  if (typeof tour.duration === 'number') {
    return tour.duration;
  }

  if (!tour.startDate || !tour.endDate) {
    return 0;
  }

  return calculateDuration(new Date(tour.startDate), new Date(tour.endDate));
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
});

const buildDefaultTranslations = (
  tour: ITourDetail,
  translationLanguages: string[],
) =>
  buildTranslationsFromTour(tour, translationLanguages).map((translation) => ({
    ...translation,
    refNumber: '',
  }));

export const TourGroupAddSheet = ({
  templateTourId,
  groupCode,
  branchId,
  branchLanguages,
  mainLanguage,
  open,
  onOpenChange,
}: TourGroupAddSheetProps) => {
  const { toast } = useToast();
  const { createTour, loading } = useCreateTour();
  const { tourDetail, loading: detailLoading } = useTourDetail({
    variables: { id: templateTourId },
    skip: !open,
  });
  const {
    allLanguages,
    translationLanguages,
    selectedLang,
    setSelectedLang,
    fieldPaths,
    labelSuffix,
  } = useTourLanguage({ branchLanguages, mainLanguage });

  const resolvedPrimaryLanguage =
    mainLanguage ?? tourDetail?.language ?? allLanguages[0] ?? '';
  const primaryTranslation = useMemo(
    () =>
      tourDetail
        ? getPrimaryTourTranslation(tourDetail, resolvedPrimaryLanguage)
        : undefined,
    [tourDetail, resolvedPrimaryLanguage],
  );

  const normalizedPricingOptions = useMemo(
    () =>
      (tourDetail?.pricingOptions ?? []).map((option) =>
        sanitizePricingOptionForSubmit({
          ...stripTypename(option),
          _id: option._id || nanoid(8),
        }),
      ),
    [tourDetail?.pricingOptions],
  );

  const initialTranslations = useMemo(
    () =>
      tourDetail
        ? buildDefaultTranslations(
            { ...tourDetail, pricingOptions: normalizedPricingOptions },
            translationLanguages,
          )
        : [],
    [tourDetail, normalizedPricingOptions, translationLanguages],
  );

  const form = useForm<GroupTourAddFormValues>({
    resolver: zodResolver(GroupTourAddSchema),
    defaultValues: {
      refNumber: '',
      startDate: undefined,
      endDate: undefined,
      translations: [],
    },
  });

  useFieldArray({
    control: form.control,
    name: 'translations',
  });

  const startDate = useWatch({
    control: form.control,
    name: 'startDate',
  });

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const computedEndDate = useMemo(() => {
    if (!startDate) {
      return undefined;
    }

    return calculateEndDate(startDate, resolveTemplateDuration(tourDetail));
  }, [startDate, tourDetail]);

  useEffect(() => {
    if (!open || !tourDetail) {
      return;
    }

    form.reset({
      refNumber: '',
      startDate: undefined,
      endDate: undefined,
      translations: initialTranslations,
    });
    setSelectedLang(resolvedPrimaryLanguage);
  }, [
    form,
    initialTranslations,
    open,
    resolvedPrimaryLanguage,
    setSelectedLang,
    tourDetail,
  ]);

  useEffect(() => {
    form.setValue('endDate', computedEndDate, {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [computedEndDate, form]);

  if (!open) {
    return null;
  }

  if (detailLoading || !tourDetail) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <Sheet.View className="w-[420px] sm:max-w-[420px] p-0">
          <Sheet.Header>
            <Sheet.Title>Add tour</Sheet.Title>
          </Sheet.Header>
          <Sheet.Content className="flex items-center justify-center py-12">
            <Spinner />
          </Sheet.Content>
        </Sheet.View>
      </Sheet>
    );
  }

  const handleSubmit = async (values: GroupTourAddFormValues) => {
    if (!branchId) {
      toast({
        title: 'Error',
        description: 'Branch not selected',
        variant: 'destructive',
      });
      return;
    }

    createTour({
      variables: {
        branchId,
        groupCode,
        language: resolvedPrimaryLanguage || undefined,
        name: primaryTranslation?.name || tourDetail.name || '',
        refNumber: values.refNumber,
        content: primaryTranslation?.content ?? tourDetail.content,
        date_status: getDateStatus(values.startDate),
        status: tourDetail.status,
        itineraryId: tourDetail.itineraryId,
        dateType: 'fixed',
        startDate: values.startDate,
        endDate: computedEndDate,
        availableFrom: undefined,
        availableTo: undefined,
        groupSize: tourDetail.groupSize,
        duration:
          computedEndDate !== undefined
            ? calculateDuration(values.startDate, computedEndDate)
            : resolveTemplateDuration(tourDetail),
        cost: tourDetail.cost,
        info1: primaryTranslation?.info1 ?? tourDetail.info1,
        info2: primaryTranslation?.info2 ?? tourDetail.info2,
        info3: primaryTranslation?.info3 ?? tourDetail.info3,
        info4: primaryTranslation?.info4 ?? tourDetail.info4,
        info5: primaryTranslation?.info5 ?? tourDetail.info5,
        images: tourDetail.images,
        imageThumbnail: tourDetail.imageThumbnail,
        attachment: tourDetail.attachment
          ? stripTypename(tourDetail.attachment)
          : tourDetail.attachment,
        advancePercent: tourDetail.advancePercent,
        advanceCheck: tourDetail.advanceCheck,
        joinPercent: tourDetail.joinPercent,
        personCost: tourDetail.personCost,
        categoryIds: tourDetail.categoryIds,
        pricingOptions: normalizedPricingOptions,
        translations: sanitizeTourTranslations(values.translations),
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Tour added to group successfully',
        });
        onOpenChange(false);
        form.reset();
      },
      onError: (error: unknown) => {
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to add tour',
          variant: 'destructive',
        });
      },
    });
  };

  const onInvalid = () => {
    const refValue = form.getValues('refNumber');

    if (!refValue?.trim()) {
      toast({
        title: 'Error',
        description:
          'Please enter the ref number in the main language before creating.',
        variant: 'destructive',
      });
      setSelectedLang(resolvedPrimaryLanguage);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="w-[420px] sm:max-w-[420px] p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, onInvalid)}
            className="flex flex-col h-full"
          >
            <Sheet.Header>
              <Sheet.Title>Add tour</Sheet.Title>
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
                  key={fieldPaths.refNumber}
                  control={form.control}
                  name={fieldPaths.refNumber}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>
                        Ref number{''}
                        <span className="text-primary">{labelSuffix}</span>
                      </Form.Label>
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
                      <Form.Label>
                        Start date <span className="text-destructive">*</span>
                      </Form.Label>
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

                <Form.Item>
                  <Form.Label>End date</Form.Label>
                  <Form.Control>
                    <Input
                      value={
                        computedEndDate
                          ? dateFormatter.format(computedEndDate)
                          : ''
                      }
                      placeholder="Calculated from duration"
                      disabled
                      readOnly
                    />
                  </Form.Control>
                </Form.Item>
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
                {loading ? 'Adding...' : 'Add tour'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
