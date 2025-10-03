import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronLeft, IconLoader2 } from '@tabler/icons-react';
import { z } from 'zod';

import { Button, Combobox, Form, Input, Separator } from 'erxes-ui';

import { useEffect, useRef, useState } from 'react';
import { useSelectUnitContext } from '../hooks/useSelectUnitContext';
import { useUnitAdd } from '../hooks/useUnitAdd';

const formSchema = z.object({
  title: z.string().min(1),
  code: z.string().min(1),
});

export const CreateUnitForm = () => {
  const [open, setOpen] = useState(false);
  const { newUnitName, onSelect, setNewUnitName } = useSelectUnitContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: newUnitName,
      code: '',
    },
  });
  const { unitsAdd, loading } = useUnitAdd();

  const selectParentRef =
    useRef<React.ElementRef<typeof Combobox.Trigger>>(null);

  useEffect(() => {
    if (selectParentRef.current) {
      selectParentRef.current.focus();
    }
  }, [selectParentRef]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    unitsAdd({
      variables: {
        ...values,
      },
      onCompleted({ unitsAdd }) {
        setNewUnitName('');
        onSelect({
          _id: unitsAdd._id,
          ...values,
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

export function SelectUnitCreateContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setNewUnitName } = useSelectUnitContext();
  return (
    <div className="overflow-auto">
      <div className="flex items-center font-medium p-1">
        <Button
          variant="ghost"
          onClick={() => {
            setNewUnitName('');
          }}
          className="pl-1 gap-1"
        >
          <IconChevronLeft />
          <h6>Create new unit</h6>
        </Button>
      </div>
      <Separator />
      {children}
    </div>
  );
}
