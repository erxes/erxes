import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  AmenityCreateFormSchema,
  AmenityCreateFormType,
} from '../constants/formSchema';

import { AmenityNameField, AmenityIconField } from './AmenityFormFields';
import { useCreateAmenity } from '../hooks/useCreateAmenity';

interface AmenityCreateSheetProps {
  branchId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export const AmenityCreateSheet = ({
  branchId,
  open,
  onOpenChange,
  showTrigger = true,
}: AmenityCreateSheetProps) => {
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

  const { createAmenity, loading } = useCreateAmenity();
  const { toast } = useToast();

  const form = useForm<AmenityCreateFormType>({
    resolver: zodResolver(AmenityCreateFormSchema),
    defaultValues: {
      name: '',
      icon: '',
    },
  });

  const handleSubmit = async (values: AmenityCreateFormType) => {
    if (!branchId) {
      toast({
        title: 'Error',
        description: 'Branch is required to create an amenity',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createAmenity({
        variables: {
          branchId,
          name: values.name,
          ...(values.icon &&
            values.icon.trim() !== '' && { icon: values.icon }),
          quick: true,
        },
      });

      toast({
        title: 'Success',
        description: 'Amenity created successfully',
      });

      form.reset();
      handleOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create amenity',
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
            Create amenity
          </Button>
        </Sheet.Trigger>
      )}

      <Sheet.View className="w-[400px] sm:max-w-[400px] p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col h-full"
          >
            <Sheet.Header>
              <Sheet.Title>Create amenity</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="overflow-y-auto flex-1 px-6 py-4 rounded-none">
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <AmenityNameField control={form.control} />
                  <AmenityIconField control={form.control} />
                </div>
              </div>
            </Sheet.Content>

            <Sheet.Footer className="bg-background">
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
