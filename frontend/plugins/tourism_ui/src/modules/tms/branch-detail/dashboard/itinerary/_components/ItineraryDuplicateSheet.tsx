import { Button, Form, Input, Sheet, ColorPicker, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateItinerary } from '../hooks/useCreateItinerary';
import { IItinerary } from '../types/itinerary';

const ItineraryDuplicateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().optional(),
});

type ItineraryDuplicateFormType = z.infer<typeof ItineraryDuplicateFormSchema>;

interface ItineraryDuplicateSheetProps {
  itinerary: IItinerary;
  branchId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ItineraryDuplicateSheet = ({
  itinerary,
  branchId,
  open,
  onOpenChange,
}: ItineraryDuplicateSheetProps) => {
  const { createItinerary, loading } = useCreateItinerary();
  const { toast } = useToast();

  const form = useForm<ItineraryDuplicateFormType>({
    resolver: zodResolver(ItineraryDuplicateFormSchema),
    defaultValues: {
      name: `${itinerary.name || ''} (copy)`,
      color: itinerary.color || '#4F46E5',
    },
  });

  const handleSubmit = async (values: ItineraryDuplicateFormType) => {
    createItinerary({
      variables: {
        branchId: branchId || itinerary.branchId,
        name: values.name,
        duration: itinerary.duration,
        color: values.color,
        images: itinerary.images,
        content: itinerary.content,
        totalCost: itinerary.totalCost,
        guideCost: itinerary.guideCost,
        driverCost: itinerary.driverCost,
        foodCost: itinerary.foodCost,
        gasCost: itinerary.gasCost,
        personCost: itinerary.personCost,
        guideCostExtra: itinerary.guideCostExtra,
        groupDays: itinerary.groupDays?.map(({ __typename: _d, ...day }) => ({
          ...day,
          elements: day.elements?.map(({ __typename: _e, ...el }) => el),
          elementsQuick: day.elementsQuick?.map(
            ({ __typename: _eq, ...el }) => el,
          ),
        })),
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          variant: 'success',
          description: 'Itinerary duplicated successfully',
        });
        onOpenChange(false);
        form.reset();
      },
      onError: (e: any) => {
        toast({
          title: 'Error',
          description: e.message,
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
              <Sheet.Title>Duplicate itinerary</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="overflow-y-auto flex-1 px-6 py-4 rounded-none">
              <div className="flex flex-col gap-4">
                <Form.Field
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>
                        Name <span className="text-destructive">*</span>
                      </Form.Label>
                      <Form.Control>
                        <Input placeholder="Itinerary name" {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Color</Form.Label>
                      <Form.Control>
                        <ColorPicker
                          value={field.value}
                          onValueChange={(value: any) => {
                            field.onChange(value);
                          }}
                          className="w-24"
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
