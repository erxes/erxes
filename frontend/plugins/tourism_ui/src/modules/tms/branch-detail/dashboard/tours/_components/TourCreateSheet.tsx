import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

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
import { useCreateTour } from '../hooks/useCreateTour';

interface TourCreateSheetProps {
  branchId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export const TourCreateSheet = ({
  branchId,
  open,
  onOpenChange,
  showTrigger = true,
}: TourCreateSheetProps) => {
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

  const { createTour, loading } = useCreateTour();
  const { toast } = useToast();

  const form = useForm<TourCreateFormType>({
    resolver: zodResolver(TourCreateFormSchema),
    defaultValues: {
      name: '',
      refNumber: '',
      status: 'draft',
      content: '',
      itineraryId: '',
      cost: 0,
      duration: 1,
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

  const handleSubmit = async (values: TourCreateFormType) => {
    if (!branchId) {
      toast({
        title: 'Error',
        description: 'Branch is required to create a tour',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createTour({
        variables: {
          branchId,
          name: values.name,
          refNumber: values.refNumber,
          date_status: 'scheduled',
          content: values.content,
          status: values.status,
          groupCode: 'hehehe',
          itineraryId: values.itineraryId,
          startDate: values.startDate,
          endDate: values.endDate,
          groupSize: values.groupSize,
          duration: values.duration,
          cost: values.cost,
          guides: values.guides,
          info1: values.info1,
          info2: values.info2,
          info3: values.info3,
          info4: values.info4,
          info5: values.info5,
          images: values.images,
          imageThumbnail: values.imageThumbnail,
          advancePercent: values.advancePercent,
          advanceCheck: values.advanceCheck,
          joinPercent: values.joinPercent,
          personCost: values.personCost,
        },
      });

      toast({
        title: 'Success',
        description: 'Tour created successfully',
      });

      form.reset();
      handleOpenChange(false);
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
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            Create tour
          </Button>
        </Sheet.Trigger>
      )}

      <Sheet.View className="w-[800px] sm:max-w-[800px] p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full"
          >
            <Sheet.Header>
              <Sheet.Title>Create tour</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="overflow-y-auto flex-1 px-6 py-4">
              <div className="flex flex-col gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <TourNameField control={form.control} />
                    <TourRefNumberField control={form.control} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <TourStatusField control={form.control} />
                    <TourItineraryIdField control={form.control} />
                  </div>
                  <TourDescriptionField control={form.control} />
                </div>

                {/* Tour Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Tour Details</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <TourCostField control={form.control} />
                    <TourDurationField control={form.control} />
                    <TourGroupSizeField control={form.control} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <TourStartDateField control={form.control} />
                    <TourEndDateField control={form.control} />
                  </div>
                </div>

                {/* Payment Settings */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Payment Settings</h3>
                  <TourAdvanceCheckField control={form.control} />
                  <div className="grid grid-cols-2 gap-4">
                    <TourAdvancePercentField control={form.control} />
                    <TourJoinPercentField control={form.control} />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Images</h3>
                  <TourImageThumbnailField control={form.control} />
                  <TourImagesField control={form.control} />
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">
                    Additional Information
                  </h3>
                  <TourInfo1Field control={form.control} />
                  <TourInfo2Field control={form.control} />
                  <TourInfo3Field control={form.control} />
                  <TourInfo4Field control={form.control} />
                  <TourInfo5Field control={form.control} />
                </div>
              </div>
            </Sheet.Content>

            <Sheet.Footer>
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
