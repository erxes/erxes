import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronLeft, IconLoader2 } from '@tabler/icons-react';
import { z } from 'zod';

import { Button, Combobox, Form, Input, Popover, Separator } from 'erxes-ui';

import { useEffect, useRef, useState } from 'react';
import { useSelectBranchesContext } from '../hooks/useSelectBranchesContext';
import { useBranchesAdd } from '../hooks/useBranchesAdd';
import { SelectBranches } from './SelectBranches';

const formSchema = z.object({
  title: z.string().min(1),
  code: z.string().min(1),
  parentId: z.string().optional(),
});

export const CreateBranchForm = () => {
  const [open, setOpen] = useState(false);
  const { newBranchName, onSelect, setNewBranchName } =
    useSelectBranchesContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: newBranchName,
      code: '',
      parentId: '',
    },
  });
  const { branchesAdd, loading } = useBranchesAdd();

  const selectParentRef =
    useRef<React.ElementRef<typeof Combobox.Trigger>>(null);

  useEffect(() => {
    if (selectParentRef.current) {
      selectParentRef.current.focus();
    }
  }, [selectParentRef]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    branchesAdd({
      variables: {
        ...values,
      },
      onCompleted({ branchesAdd }) {
        setNewBranchName('');
        onSelect({
          _id: branchesAdd._id,
          order: branchesAdd.order,
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
                <Form.Label>Parent Branch</Form.Label>
                <SelectBranches
                  value={field.value}
                  onValueChange={(branch) => {
                    field.onChange(branch);
                    setOpen(false);
                  }}
                >
                  <Popover open={open} onOpenChange={setOpen}>
                    <Form.Control>
                      <Combobox.Trigger ref={selectParentRef}>
                        <SelectBranches.Value />
                      </Combobox.Trigger>
                    </Form.Control>
                    <Combobox.Content>
                      <SelectBranches.Command disableCreateOption />
                    </Combobox.Content>
                  </Popover>
                </SelectBranches>
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

export function SelectBranchCreateContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setNewBranchName } = useSelectBranchesContext();
  return (
    <div className="overflow-auto">
      <div className="flex items-center font-medium p-1">
        <Button
          variant="ghost"
          onClick={() => {
            setNewBranchName('');
          }}
          className="pl-1 gap-1"
        >
          <IconChevronLeft />
          <h6>Create new branch</h6>
        </Button>
      </div>
      <Separator />
      {children}
    </div>
  );
}
