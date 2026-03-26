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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronDown } from '@tabler/icons-react';

import {
  ItineraryCreateFormSchema,
  ItineraryCreateFormType,
} from '../constants/formSchema';

import {
  ItineraryNameField,
  ItineraryContentField,
  ItineraryColorField,
  ItineraryImageField,
  ItineraryGuideCostField,
  ItineraryDriverCostField,
  ItineraryFoodCostField,
  ItineraryGasCostField,
  ItineraryGuideCostExtraField,
  ItineraryPersonCostField,
} from './ItineraryFormFields';
import { useEditItinerary } from '../hooks/useEditItinerary';
import { useItineraryDetail } from '../hooks/useItineraryDetail';
import { ItineraryBuilder } from '../itinerary-builder';
import { useElements } from '../../elements/hooks/useElements';
import { useAmenities } from '../../amenities/hooks/useAmenities';

interface ItineraryEditSheetProps {
  itineraryId?: string;
  branchId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type Step = 'build' | 'info';

export const ItineraryEditSheet = ({
  itineraryId,
  branchId,
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
      content: '',
      duration: 1,
      color: '#4F46E5',
      images: [],
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

      form.setValue('name', itinerary.name || '');
      form.setValue('content', itinerary.content || '');
      form.setValue('duration', itinerary.duration || 1);
      form.setValue('color', itinerary.color || '#4F46E5');
      form.setValue('images', itinerary.images || []);
      form.setValue('totalCost', itinerary.totalCost || 0);
      form.setValue('groupDays', transformedGroupDays);
      form.setValue('guideCost', itinerary.guideCost || 0);
      form.setValue('driverCost', itinerary.driverCost || 0);
      form.setValue('foodCost', itinerary.foodCost || 0);
      form.setValue('gasCost', itinerary.gasCost || 0);
      form.setValue('personCost', itinerary.personCost || {});
      form.setValue('guideCostExtra', itinerary.guideCostExtra || 0);
    }
  }, [itinerary, open, form]);

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
          content: values.content,
          duration: totalDays,
          color: values.color,
          images: values.images?.slice(0, 1) || [],
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
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col h-full"
            >
              <Sheet.Header>
                <Sheet.Title>Edit itinerary</Sheet.Title>
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
                      isEditMode={true}
                    />
                  </Tabs.Content>

                  <Tabs.Content value="info" className="overflow-y-auto p-6">
                    <div className="space-y-4 w-full">
                      <div className="grid grid-cols-10 gap-4 pb-4 border-b border-muted">
                        <div className="col-span-2">
                          <ItineraryColorField control={form.control} />
                        </div>

                        <div className="col-span-8">
                          <ItineraryNameField control={form.control} />
                        </div>
                      </div>

                      <ItineraryContentField control={form.control} />

                      <ItineraryImageField control={form.control} />

                      <Collapsible
                        open={showMoreOptions}
                        onOpenChange={setShowMoreOptions}
                        className="flex flex-col items-center my-5"
                      >
                        <Collapsible.Content className="order-1 pt-4 space-y-4 w-full">
                          <div className="grid grid-cols-2 gap-4">
                            <ItineraryGuideCostField control={form.control} />
                            <ItineraryDriverCostField control={form.control} />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <ItineraryFoodCostField control={form.control} />
                            <ItineraryGasCostField control={form.control} />
                          </div>

                          <ItineraryGuideCostExtraField
                            control={form.control}
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
