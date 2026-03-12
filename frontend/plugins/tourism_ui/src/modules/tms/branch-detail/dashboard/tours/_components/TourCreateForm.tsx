import { Form, Sheet, Button, Tabs, useToast } from 'erxes-ui';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';

import { GET_ITINERARIES } from '../../itinerary/graphql/queries';
import { useCreateTour } from '../hooks/useCreateTour';

import {
  TourCreateFormSchema,
  TourCreateFormType,
} from '../constants/formSchema';

import {
  TourDescriptionField,
  TourNameField,
  TourRefNumberField,
  TourStatusField,
  TourCostField,
  TourPersonCostField,
  TourDurationField,
  TourGroupSizeField,
  TourStartDateField,
  TourEndDateField,
  TourInfo1Field,
  TourInfo2Field,
  TourInfo3Field,
  TourInfo4Field,
  TourInfo5Field,
  TourAdvanceCheckField,
  TourAdvancePercentField,
  TourJoinPercentField,
  TourItineraryIdField,
  TourImageThumbnailField,
  TourImagesField,
} from './TourFormFields';

interface Props {
  branchId?: string;
  onSuccess?: () => void;
}

interface Itinerary {
  _id: string;
  duration?: number;
}

const normalizePersonCost = (personCost?: TourCreateFormType['personCost']) => {
  return Object.entries(personCost ?? {}).reduce<Record<string, number>>(
    (acc, [range, price]) => {
      const normalizedRange = range.trim();
      const normalizedPrice = Number(price);

      if (!normalizedRange || Number.isNaN(normalizedPrice)) {
        return acc;
      }

      acc[normalizedRange] = normalizedPrice;

      return acc;
    },
    {},
  );
};

export const TourCreateForm = ({ branchId, onSuccess }: Props) => {
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
      cost: 0,
      duration: 0,
      groupSize: 0,
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
      personCost: {},
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
    if (!branchId) {
      toast({
        title: 'Error',
        description: 'Branch required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const personCost = normalizePersonCost(values.personCost);

      await createTour({
        variables: {
          branchId,
          ...values,
          date_status: 'scheduled',
          groupCode: 'default',
          personCost,
        },
      });

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col h-full"
      >
        <Sheet.Header>
          <Sheet.Title>Create tour</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>

        <Sheet.Content className="overflow-y-auto flex-1 px-6 py-4 rounded-none">
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Basic Information</h3>

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

              <TourDescriptionField control={form.control} />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Tour Details</h3>

              <div className="grid grid-cols-3 gap-4">
                <TourCostField control={form.control} />
                <TourDurationField control={form.control} />
                <TourGroupSizeField control={form.control} />
              </div>

              <TourPersonCostField control={form.control} />

              <div className="grid grid-cols-2 gap-4">
                <TourStartDateField control={form.control} />
                <TourEndDateField control={form.control} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Payment Settings</h3>

              <TourAdvanceCheckField control={form.control} />

              <div className="grid grid-cols-2 gap-4">
                <TourAdvancePercentField control={form.control} />
                <TourJoinPercentField control={form.control} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Images</h3>

              <TourImageThumbnailField control={form.control} />
              <TourImagesField control={form.control} />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Additional Information</h3>

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
