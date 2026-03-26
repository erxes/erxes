import { Form, Sheet, Button, Tabs, useToast, Spinner } from 'erxes-ui';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { TourSideTab } from './TourOrdersSidePanel';

import { GET_ITINERARIES } from '../../itinerary/graphql/queries';
import { useEditTour } from '../hooks/useEditTour';
import { useTourDetail } from '../hooks/useTourDetail';

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
  TourDateSchedulingField,
  TourPricingOptionsField,
} from './TourFormFields';
import { TourOrdersSidePanel } from './TourOrdersSidePanel';

interface Props {
  tourId: string;
  branchId?: string;
  onSuccess?: () => void;
  sideTab?: TourSideTab | null;
  onSideTabChange?: (tab: TourSideTab | null) => void;
}

interface Itinerary {
  _id: string;
  duration?: number;
}

const hideFields = false;

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

export const TourEditForm = ({
  tourId,
  branchId,
  onSuccess,
  sideTab: sideTabProp,
  onSideTabChange,
}: Props) => {
  const { toast } = useToast();
  const { editTour, loading: editLoading } = useEditTour();
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [sideTabLocal, setSideTabLocal] = useState<TourSideTab | null>(null);

  const sideTab = sideTabProp !== undefined ? sideTabProp : sideTabLocal;
  const setSideTab = onSideTabChange ?? setSideTabLocal;

  const { tourDetail, loading: tourLoading } = useTourDetail({
    variables: { id: tourId },
    skip: !tourId,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
  });

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
      availableFrom: undefined,
      availableTo: undefined,
      startDate: undefined,
      endDate: undefined,
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
      guides: [],
      pricingOptions: [],
    },
  });

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
    if (!tourDetail || !tourDetail._id) return;

    const tour = tourDetail;

    form.reset(
      {
        name: tour.name ?? '',
        refNumber: tour.refNumber ?? '',
        status: tour.status ?? 'draft',
        content: tour.content ?? '',
        itineraryId: tour.itineraryId ?? '',
        categoryIds: tour.categoryIds ?? [],
        duration: tour.duration ?? 0,
        groupSize: tour.groupSize ?? 0,
        advanceCheck: tour.advanceCheck ?? false,
        advancePercent: tour.advancePercent ?? 0,
        joinPercent: tour.joinPercent ?? 0,
        info1: tour.info1 ?? '',
        info2: tour.info2 ?? '',
        info3: tour.info3 ?? '',
        info4: tour.info4 ?? '',
        info5: tour.info5 ?? '',
        images: tour.images ?? [],
        imageThumbnail: tour.imageThumbnail ?? '',
        guides: [],
        pricingOptions: tour.pricingOptions ?? [],
        isFlexibleDate: tour.dateType === 'flexible',
        isGroupTour: false,
        startDate: tour.startDate ? new Date(tour.startDate) : undefined,
        endDate: tour.endDate ? new Date(tour.endDate) : undefined,
        availableFrom: tour.availableFrom
          ? new Date(tour.availableFrom)
          : undefined,
        availableTo: tour.availableTo ? new Date(tour.availableTo) : undefined,
      },
      { keepDirty: false, keepTouched: false },
    );
    setEditorResetKey((prev) => prev + 1);
  }, [tourDetail, form]);

  useEffect(() => {
    if (selectedItinerary?.duration) {
      form.setValue('duration', selectedItinerary.duration);
    }
  }, [selectedItinerary, form]);

  useEffect(() => {
    if (!startDate || !duration || Array.isArray(startDate)) return;

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Number(duration));

    form.setValue('endDate', endDate);
  }, [startDate, duration, form]);

  const handleSubmit = async (values: TourCreateFormType) => {
    if (!tourId) {
      toast({
        title: 'Error',
        description: 'Tour ID required',
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
        ...restValues
      } = values;

      const normalizedPricingOptions = pricingOptions.map((opt) => ({
        ...opt,
        accommodationType: opt.accommodationType
          ? opt.accommodationType.trim().toLowerCase()
          : opt.accommodationType,
      }));

      const isFlexible = values.isFlexibleDate;

      const normalizedStartDate = Array.isArray(values.startDate)
        ? values.startDate?.[0]
        : values.startDate;

      await editTour({
        id: tourId,
        ...restValues,
        pricingOptions: normalizedPricingOptions,
        dateType: isFlexible ? 'flexible' : 'fixed',
        startDate: isFlexible ? undefined : normalizedStartDate,
        endDate: isFlexible
          ? undefined
          : normalizedStartDate && values.duration
          ? calculateEndDate(normalizedStartDate, values.duration)
          : undefined,
        availableFrom: isFlexible ? values.availableFrom : undefined,
        availableTo: isFlexible ? values.availableTo : undefined,
        dateStatus: isFlexible
          ? 'unscheduled'
          : getDateStatus(normalizedStartDate),
      });

      toast({
        title: 'Success',
        description: 'Tour updated successfully',
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update tour',
        variant: 'destructive',
      });
    }
  };
  const loading = editLoading || tourLoading;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col h-full"
      >
        <Sheet.Header>
          <Sheet.Title>Edit tour</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="overflow-hidden flex-1 p-0">
          {tourLoading ? (
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="flex h-full">
              <div className="flex overflow-y-auto flex-col flex-1 gap-6 px-6 py-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <TourNameField control={form.control} />
                    <TourRefNumberField control={form.control} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <TourStatusField control={form.control} />
                    <TourItineraryIdField
                      control={form.control}
                      branchId={branchId}
                    />
                  </div>

                  <TourCategoryField control={form.control} />

                  <TourDescriptionField
                    control={form.control}
                    key={`tour-content-${editorResetKey}`}
                  />
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

                <TourPricingOptionsField control={form.control} />

                {hideFields && (
                  <div className="pt-4 space-y-4 border-t">
                    <TourAdvanceCheckField control={form.control} />

                    <div className="grid grid-cols-2 gap-4">
                      <TourAdvancePercentField control={form.control} />
                      <TourJoinPercentField control={form.control} />
                    </div>
                  </div>
                )}

                <div className="pt-4 space-y-4 border-t">
                  <TourImageThumbnailField control={form.control} />
                  <TourImagesField control={form.control} />
                </div>

                <div className="pt-4 space-y-4 border-t">
                  <Tabs defaultValue="info1" className="w-full">
                    <Tabs.List className="grid grid-cols-5 w-full">
                      <Tabs.Trigger value="info1">Included</Tabs.Trigger>
                      <Tabs.Trigger value="info2">Not Included</Tabs.Trigger>
                      <Tabs.Trigger value="info3">Highlights</Tabs.Trigger>
                      <Tabs.Trigger value="info4">
                        Additional Information
                      </Tabs.Trigger>
                      <Tabs.Trigger value="info5">Notes</Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="info1" className="pt-4">
                      <TourInfo1Field control={form.control} />
                    </Tabs.Content>

                    <Tabs.Content value="info2" className="pt-4">
                      <TourInfo2Field control={form.control} />
                    </Tabs.Content>

                    <Tabs.Content value="info3" className="pt-4">
                      <TourInfo3Field control={form.control} />
                    </Tabs.Content>

                    <Tabs.Content value="info4" className="pt-4">
                      <TourInfo4Field control={form.control} />
                    </Tabs.Content>

                    <Tabs.Content value="info5" className="pt-4">
                      <TourInfo5Field control={form.control} />
                    </Tabs.Content>
                  </Tabs>
                </div>
              </div>
              <TourOrdersSidePanel
                tourId={tourId}
                activeTab={sideTab}
                onTabChange={setSideTab}
              />
            </div>
          )}
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
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
