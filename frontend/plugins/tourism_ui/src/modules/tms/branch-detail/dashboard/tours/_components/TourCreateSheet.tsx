import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  TourCreateFormSchema,
  TourCreateFormType,
} from '../constants/formSchema';
import { TourDescriptionField, TourNameField } from './TourFormFields';
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
  const handleOpenChange = onOpenChange || setInternalOpen;
  const { createTour, loading } = useCreateTour();
  const { toast } = useToast();

  const form = useForm<TourCreateFormType>({
    resolver: zodResolver(TourCreateFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleSubmit = (values: TourCreateFormType) => {
    if (!branchId) {
      toast({
        title: 'Error',
        description: 'Branch is required to create a tour',
        variant: 'destructive',
      });
      return;
    }

    createTour({
      variables: {
        branchId,
        name: values.name,
        content: values.description,
        date_status: 'scheduled',
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Tour created successfully',
        });
        form.reset();
        handleOpenChange(false);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description:
            error instanceof Error ? error.message : 'Failed to create tour',
          variant: 'destructive',
        });
      },
    });
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
      <Sheet.View className="w-[540px] sm:max-w-[540px] p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full"
          >
            <Sheet.Header>
              <Sheet.Title>Create tour</Sheet.Title>

              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="flex-1 px-4 py-4">
              <div className="flex flex-col gap-4">
                <TourNameField control={form.control} />
                <TourDescriptionField control={form.control} />
              </div>
            </Sheet.Content>
            <Sheet.Footer>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
