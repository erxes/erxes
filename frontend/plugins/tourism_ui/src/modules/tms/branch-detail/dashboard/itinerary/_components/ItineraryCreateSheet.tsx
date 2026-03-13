import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Sheet, useToast, Tabs } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  ItineraryCreateFormSchema,
  ItineraryCreateFormType,
} from '../constants/formSchema';

import {
  ItineraryNameField,
  ItineraryColorField,
  ItineraryGuideCostField,
  ItineraryDriverCostField,
  ItineraryFoodCostField,
  ItineraryGasCostField,
  ItineraryGuideCostExtraField,
  ItineraryPersonCostField,
} from './ItineraryFormFields';
import { useCreateItinerary } from '../hooks/useCreateItinerary';
import { ItineraryBuilder } from '../itinerary-builder';
import { useElements } from '../../elements/hooks/useElements';
import { useAmenities } from '../../amenities/hooks/useAmenities';

interface ItineraryCreateSheetProps {
  branchId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

type Step = 'build' | 'info';

export const ItineraryCreateSheet = ({
  branchId,
  open,
  onOpenChange,
  showTrigger = true,
}: ItineraryCreateSheetProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('build');

  const { toast } = useToast();
  const { createItinerary, loading } = useCreateItinerary();

  const isControlled = typeof open === 'boolean';
  const sheetOpen = isControlled ? open : internalOpen;

  const { elements: elementsData = [] } = useElements({
    variables: { branchId, quick: false },
    skip: !branchId,
  });

  const { amenities: amenitiesData = [] } = useAmenities({
    variables: { branchId, quick: true },
    skip: !branchId,
  });

  const form = useForm<ItineraryCreateFormType>({
    resolver: zodResolver(ItineraryCreateFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      duration: 1,
      color: '#000000',
      totalCost: 0,
      groupDays: [],
      guideCost: 0,
      driverCost: 0,
      foodCost: 0,
      gasCost: 0,
      personCost: {},
      guideCostExtra: 0,
    },
  });

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      form.reset();
      setCurrentStep('build');
    }

    if (isControlled) {
      onOpenChange?.(value);
    } else {
      setInternalOpen(value);
    }
  };

  const stepFields: Record<Step, (keyof ItineraryCreateFormType)[]> = {
    build: ['groupDays'],
    info: ['name', 'color'],
  };

  const handleNextStep = async () => {
    const fields = stepFields.build;

    const isValid = await form.trigger(fields);

    if (!isValid) return;

    form.clearErrors();
    setCurrentStep('info');
  };

  const handleSubmit = async (values: ItineraryCreateFormType) => {
    if (!branchId) {
      toast({
        title: 'Error',
        description: 'Branch is required to create an itinerary',
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

    const normalizedPersonCost: Record<string, number> = Object.fromEntries(
      Object.entries(values.personCost || {}).filter(
        (entry): entry is [string, number] => {
          const value = entry[1];

          return typeof value === 'number' && !Number.isNaN(value);
        },
      ),
    );

    try {
      await createItinerary({
        variables: {
          branchId,
          name: values.name,
          duration: totalDays,
          color: values.color,
          totalCost,
          groupDays: transformedGroupDays,
          guideCost: values.guideCost,
          driverCost: values.driverCost,
          foodCost: values.foodCost,
          gasCost: values.gasCost,
          personCost: normalizedPersonCost,
          guideCostExtra: values.guideCostExtra,
        },
      });

      toast({
        title: 'Success',
        description: 'Itinerary created successfully',
      });

      form.reset();
      handleOpenChange(false);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to create itinerary';

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
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            Create itinerary
          </Button>
        </Sheet.Trigger>
      )}

      <Sheet.View
        className={`p-0 transition-all duration-300 ease-in-out ${sheetWidth}`}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full"
          >
            <Sheet.Header>
              <Sheet.Title>Create itinerary</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="overflow-hidden flex-1 p-0">
              <Tabs value={currentStep} className="flex flex-col h-full">
                <Tabs.Content
                  value="build"
                  className="overflow-hidden flex-1 p-3"
                >
                  <ItineraryBuilder
                    control={form.control}
                    setValue={form.setValue}
                    watch={form.watch}
                    elements={elementsData}
                    amenities={amenitiesData}
                    branchId={branchId}
                  />
                </Tabs.Content>

                <Tabs.Content value="info" className="overflow-y-auto p-3">
                  <div className="space-y-4 w-full">
                    <div className="grid grid-cols-10 gap-4 pb-4 border-b border-muted">
                      <div className="col-span-2">
                        <ItineraryColorField control={form.control} />
                      </div>

                      <div className="col-span-8">
                        <ItineraryNameField control={form.control} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <ItineraryGuideCostField control={form.control} />
                      <ItineraryDriverCostField control={form.control} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <ItineraryFoodCostField control={form.control} />
                      <ItineraryGasCostField control={form.control} />
                    </div>

                    <ItineraryGuideCostExtraField control={form.control} />

                    <ItineraryPersonCostField
                      control={form.control}
                      duration={form.watch('groupDays')?.length || 1}
                    />
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
                    disabled={loading}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    disabled={loading}
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
                    disabled={loading}
                  >
                    Back
                  </Button>

                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              )}
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
