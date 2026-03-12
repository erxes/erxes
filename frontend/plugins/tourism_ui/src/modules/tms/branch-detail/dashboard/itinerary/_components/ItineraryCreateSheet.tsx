import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  ItineraryCreateFormSchema,
  ItineraryCreateFormType,
} from '../constants/formSchema';

import {
  ItineraryDescriptionField,
  ItineraryNameField,
  ItineraryDurationField,
  ItineraryColorField,
  ItineraryTotalCostField,
  ItineraryImagesField,
} from './ItineraryFormFields';
import { useCreateItinerary } from '../hooks/useCreateItinerary';

interface ItineraryCreateSheetProps {
  branchId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export const ItineraryCreateSheet = ({
  branchId,
  open,
  onOpenChange,
  showTrigger = true,
}: ItineraryCreateSheetProps) => {
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

  const { createItinerary, loading } = useCreateItinerary();
  const { toast } = useToast();

  const form = useForm<ItineraryCreateFormType>({
    resolver: zodResolver(ItineraryCreateFormSchema),
    defaultValues: {
      name: '',
      content: '',
      duration: 1,
      color: '#000000',
      totalCost: 0,
      images: [],
      groupDays: [],
    },
  });

  const handleSubmit = async (values: ItineraryCreateFormType) => {
    if (!branchId) {
      toast({
        title: 'Error',
        description: 'Branch is required to create an itinerary',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createItinerary({
        variables: {
          branchId,
          name: values.name,
          content: values.content,
          duration: values.duration,
          color: values.color,
          totalCost: values.totalCost,
          images: values.images,
          groupDays: values.groupDays,
        },
      });

      toast({
        title: 'Success',
        description: 'Itinerary created successfully',
      });

      form.reset();
      handleOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create itinerary',
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
            Create itinerary
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
              <Sheet.Title>Create itinerary</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="overflow-y-auto flex-1 px-6 py-4">
              <div className="flex flex-col gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Basic Information</h3>
                  <ItineraryNameField control={form.control} />
                  <ItineraryDescriptionField control={form.control} />
                </div>

                {/* Itinerary Details */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Itinerary Details</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <ItineraryDurationField control={form.control} />
                    <ItineraryTotalCostField control={form.control} />
                    <ItineraryColorField control={form.control} />
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">Images</h3>
                  <ItineraryImagesField control={form.control} />
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
