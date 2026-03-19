import { IconPlus } from '@tabler/icons-react';
import { Button, Form, Sheet, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  ElementCreateFormSchema,
  ElementCreateFormType,
} from '../constants/formSchema';

import {
  ElementNameField,
  ElementNoteField,
  ElementStartTimeField,
  ElementDurationField,
  ElementCostField,
} from './ElementFormFields';

import { SelectElementCategories } from './SelectElementCategories';
import { useCreateElement } from '../hooks/useCreateElement';

interface ElementCreateSheetProps {
  branchId?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export const ElementCreateSheet = ({
  branchId,
  open,
  onOpenChange,
  showTrigger = true,
}: ElementCreateSheetProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = typeof open === 'boolean';
  const sheetOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (value: boolean) => {
    if (onOpenChange) onOpenChange(value);
    else setInternalOpen(value);
  };

  const { createElement, loading } = useCreateElement();
  const { toast } = useToast();

  const form = useForm<ElementCreateFormType>({
    resolver: zodResolver(ElementCreateFormSchema),
    defaultValues: {
      name: '',
      note: '',
      startTime: '',
      duration: 0,
      cost: 0,
      categories: [],
    },
  });

  const handleSubmit = async (values: ElementCreateFormType) => {
    if (!branchId) {
      toast({
        title: 'Error',
        description: 'Branch is required to create an element',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createElement({
        variables: {
          branchId,
          name: values.name,
          note: values.note,
          startTime: values.startTime,
          duration: values.duration,
          cost: values.cost,
          categories: values.categories,
          quick: false,
        },
      });

      toast({
        title: 'Success',
        description: 'Element created successfully',
      });

      form.reset();
      handleOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create element',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <Sheet.Trigger asChild>
          <Button type="button">
            <IconPlus />
            Create element
          </Button>
        </Sheet.Trigger>
      )}

      <Sheet.View className="w-[600px] sm:max-w-[600px] p-0">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.stopPropagation();
              form.handleSubmit(handleSubmit)(e);
            }}
            className="flex flex-col h-full"
          >
            <Sheet.Header>
              <Sheet.Title>Create element</Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>

            <Sheet.Content className="overflow-y-auto flex-1 px-6 py-4 rounded-none">
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <ElementNameField control={form.control} />

                  <div className="grid grid-cols-3 gap-4">
                    <ElementStartTimeField control={form.control} />
                    <ElementDurationField control={form.control} />
                    <ElementCostField control={form.control} />
                  </div>
                </div>

                <div className="space-y-4">
                  <SelectElementCategories control={form.control} />
                  <ElementNoteField control={form.control} />
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
