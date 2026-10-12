import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconChevronLeft, IconLoader2 } from '@tabler/icons-react';
import { z } from 'zod';

import { Button, Combobox, Form, Input, Popover, Separator } from 'erxes-ui';

import { useTagsAdd } from '../hooks/useTagsAdd';
import { SelectTags } from './SelectTags';
import { useSelectTagsContext } from '../hooks/useSelectTagsContext';
import { useEffect, useRef, useState } from 'react';

const formSchema = z.object({
  name: z.string().min(1),
  parentId: z.string().optional(),
});

export const CreateTagForm = () => {
  const [open, setOpen] = useState(false);
  const { newTagName, tagType, onSelect, setNewTagName } =
    useSelectTagsContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: newTagName,
      parentId: '',
    },
  });
  const { addTag, loading } = useTagsAdd();

  const selectParentRef =
    useRef<React.ElementRef<typeof Combobox.Trigger>>(null);

  useEffect(() => {
    if (selectParentRef.current) {
      selectParentRef.current.focus();
    }
  }, [selectParentRef]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addTag({
      variables: {
        ...values,
        type: tagType,
      },
      onCompleted({ tagsAdd }) {
        setNewTagName('');
        onSelect({
          _id: tagsAdd._id,
          ...values,
          order: tagsAdd.order,
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
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Name</Form.Label>
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
                <Form.Label>Parent Tag</Form.Label>
                <SelectTags
                  tagType={tagType}
                  value={field.value}
                  onValueChange={(tag) => {
                    field.onChange(tag);
                    setOpen(false);
                  }}
                >
                  <Popover open={open} onOpenChange={setOpen}>
                    <Form.Control>
                      <Combobox.Trigger ref={selectParentRef}>
                        <SelectTags.Value />
                      </Combobox.Trigger>
                    </Form.Control>
                    <Combobox.Content>
                      <SelectTags.Command disableCreateOption />
                    </Combobox.Content>
                  </Popover>
                </SelectTags>
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

export function SelectTagCreateContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setNewTagName } = useSelectTagsContext();
  return (
    <div className="overflow-auto">
      <div className="flex items-center font-medium p-1">
        <Button
          variant="ghost"
          onClick={() => {
            setNewTagName('');
          }}
          className="pl-1 gap-1"
        >
          <IconChevronLeft />
          <h6>Create new tag</h6>
        </Button>
      </div>
      <Separator />
      {children}
    </div>
  );
}
