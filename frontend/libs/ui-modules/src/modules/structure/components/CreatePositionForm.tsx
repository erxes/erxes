import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronLeft, IconLoader2 } from '@tabler/icons-react';
import { z } from 'zod';

import { Button, Combobox, Form, Input, Popover, Separator } from 'erxes-ui';

import { useEffect, useRef, useState } from 'react';
import { useSelectPositionsContext } from '../hooks/useSelectPositionsContext';
import { usePositionsAdd } from '../hooks/usePositionsAdd';
import { SelectPositions } from './SelectPositions';

const formSchema = z.object({
  title: z.string().min(1),
  code: z.string().min(1),
  parentId: z.string().optional(),
});

export const CreatePositionForm = () => {
  const [open, setOpen] = useState(false);
  const { newPositionName, onSelect, setNewPositionName } =
    useSelectPositionsContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: newPositionName,
      code: '',
      parentId: '',
    },
  });
  const { positionsAdd, loading } = usePositionsAdd();

  const selectParentRef =
    useRef<React.ElementRef<typeof Combobox.Trigger>>(null);

  useEffect(() => {
    if (selectParentRef.current) {
      selectParentRef.current.focus();
    }
  }, [selectParentRef]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    positionsAdd({
      variables: {
        ...values,
      },
      onCompleted({ positionsAdd }) {
        setNewPositionName('');
        onSelect({
          _id: positionsAdd._id,
          ...values,
          order: positionsAdd.order,
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-3 p-3 pb-10">
          <Form.Field
            control={form.control}
            name="title"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Title</Form.Label>
                <Input {...field} />
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="code"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Code</Form.Label>
                <Input {...field} />
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <Form.Item className="mb-2">
                <Form.Label>Parent Position</Form.Label>
                <SelectPositions
                  value={field.value}
                  onValueChange={(position) => {
                    field.onChange(position);
                    setOpen(false);
                  }}
                >
                  <Popover open={open} onOpenChange={setOpen}>
                    <Form.Control>
                      <Combobox.Trigger ref={selectParentRef}>
                        <SelectPositions.Value />
                      </Combobox.Trigger>
                    </Form.Control>
                    <Combobox.Content>
                      <SelectPositions.Command disableCreateOption />
                    </Combobox.Content>
                  </Popover>
                </SelectPositions>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        <Separator />
        <div className="p-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <IconLoader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Create'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export function SelectPositionCreateContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setNewPositionName } = useSelectPositionsContext();
  return (
    <div className="overflow-auto">
      <div className="flex items-center font-medium p-1">
        <Button
          variant="ghost"
          onClick={() => {
            setNewPositionName('');
          }}
          className="pl-1 gap-1"
        >
          <IconChevronLeft />
          <h6>Create new position</h6>
        </Button>
      </div>
      <Separator />
      {children}
    </div>
  );
}
