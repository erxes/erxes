import { Button, Form, Input, Popover, cn, toast } from 'erxes-ui';
import {
  ChecklistFormType,
  checklistFormSchema,
} from './constants/checklistFormSchema';

import { IconLoader } from '@tabler/icons-react';
import { useChecklistsAdd } from '@/deals/cards/hooks/useChecklists';
import { useForm } from 'react-hook-form';
import { useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

const ChecklistForm = () => {
  const form = useForm<ChecklistFormType>({
    resolver: zodResolver(checklistFormSchema),
  });

  const { checklistsAdd, loading } = useChecklistsAdd();
  const closeRef = useRef<HTMLButtonElement>(null);

  const onSubmit = (data: ChecklistFormType) => {
    checklistsAdd({
      variables: {
        ...data,
      },
      onCompleted: () => {
        toast({ title: 'Success!' });
        form.reset();

        closeRef.current?.click();
      },
      onError: (error) =>
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        }),
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden"
      >
        <h3 className="text-sm font-semibold text-gray-600 border-b pb-2">
          Add Checklist
        </h3>
        <div className="flex-auto overflow-hidden py-2">
          <Form.Field
            control={form.control}
            name="title"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>NAME</Form.Label>
                <Form.Control>
                  <Input {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>

        <div className="flex justify-end flex-shrink-0 gap-3">
          <Popover.Close ref={closeRef}>
            <Button
              type="button"
              variant="ghost"
              className="bg-background hover:bg-background/90"
            >
              Cancel
            </Button>
          </Popover.Close>
          <Button
            type="submit"
            className={cn(
              loading
                ? 'bg-primary/50 text-primary-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            {loading ? <IconLoader className="w-4 h-4 animate-spin" /> : 'Save'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ChecklistForm;
