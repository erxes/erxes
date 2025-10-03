import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronLeft, IconLoader2 } from '@tabler/icons-react';
import { z } from 'zod';

import { Button, Combobox, Form, Input, Popover, Separator } from 'erxes-ui';

import { useEffect, useRef, useState } from 'react';
import { useSelectDepartmentsContext } from '../hooks/useSelectDepartmentsContext';
import { useDepartmentsAdd } from '../hooks/useDepartmentsAdd';
import { SelectDepartments } from './SelectDepartments';

const formSchema = z.object({
  title: z.string().min(1),
  code: z.string().min(1),
  parentId: z.string().optional(),
});

export const CreateDepartmentForm = () => {
  const [open, setOpen] = useState(false);
  const { newDepartmentName, onSelect, setNewDepartmentName } =
    useSelectDepartmentsContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: newDepartmentName,
      code: '',
      parentId: '',
    },
  });
  const { departmentsAdd, loading } = useDepartmentsAdd();

  const selectParentRef =
    useRef<React.ElementRef<typeof Combobox.Trigger>>(null);

  useEffect(() => {
    if (selectParentRef.current) {
      selectParentRef.current.focus();
    }
  }, [selectParentRef]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    departmentsAdd({
      variables: {
        ...values,
      },
      onCompleted({ departmentsAdd }) {
        setNewDepartmentName('');
        onSelect({
          _id: departmentsAdd._id,
          order: departmentsAdd.order,
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
          <Form.Field
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <Form.Item className="mb-2">
                <Form.Label>Parent Department</Form.Label>
                <SelectDepartments
                  value={field.value}
                  onValueChange={(department) => {
                    field.onChange(department);
                    setOpen(false);
                  }}
                >
                  <Popover open={open} onOpenChange={setOpen}>
                    <Form.Control>
                      <Combobox.Trigger ref={selectParentRef}>
                        <SelectDepartments.Value />
                      </Combobox.Trigger>
                    </Form.Control>
                    <Combobox.Content>
                      <SelectDepartments.Command disableCreateOption />
                    </Combobox.Content>
                  </Popover>
                </SelectDepartments>
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

export function SelectDepartmentsCreateContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setNewDepartmentName } = useSelectDepartmentsContext();
  return (
    <div className="overflow-auto">
      <div className="flex items-center font-medium p-1">
        <Button
          variant="ghost"
          onClick={() => {
            setNewDepartmentName('');
          }}
          className="pl-1 gap-1"
        >
          <IconChevronLeft />
          <h6>Create new department</h6>
        </Button>
      </div>
      <Separator />
      {children}
    </div>
  );
}
