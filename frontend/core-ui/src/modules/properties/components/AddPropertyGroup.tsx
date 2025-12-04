import { IPropertyGroupForm } from '@/properties/types/Properties';
import {
  Button,
  Form,
  Input,
  Sheet,
  Spinner,
  Textarea,
  toast,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useAddPropertyGroup } from '../hooks/useAddPropertyGroup';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertyGroupSchema } from '../propertySchema';

export const AddPropertyGroup = () => {
  const [contentType] = useQueryState<string>('type');
  const { addPropertyGroup, loading } = useAddPropertyGroup();
  const form = useForm<IPropertyGroupForm>({
    mode: 'onBlur',
    resolver: zodResolver(propertyGroupSchema),
    defaultValues: {
      name: '',
      description: '',
      code: '',
    },
  });
  const [open, setOpen] = useState<boolean>(false);

  const submitHandler: SubmitHandler<IPropertyGroupForm> = (data) => {
    addPropertyGroup({
      variables: {
        doc: {
          ...data,
          contentType: contentType || '',
          order: 0,
        },
      },
      onCompleted: () => {
        toast({ title: 'Created a group', variant: 'success' });
        form.reset();
        setOpen(false);
      },
    });
  };

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <Sheet.Trigger asChild>
        <Button variant="outline">Add Group</Button>
      </Sheet.Trigger>
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submitHandler)}
            className=" flex flex-col gap-0 w-full h-full"
          >
            <Sheet.Header>
              <Sheet.Title className="text-lg text-foreground flex items-center gap-1">
                Add Group
              </Sheet.Title>
              <Sheet.Description className="sr-only">
                Add a new group for the content type {contentType}
              </Sheet.Description>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4 gap-5">
              {/* Add your form fields here, for example: */}

              <Form.Field
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Group Name</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter group name"
                        className="input"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                name="description"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Description</Form.Label>
                    <Form.Control>
                      <Textarea
                        {...field}
                        placeholder="Enter group description"
                        className="input"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                name="code"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Code</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter group code"
                        className="input"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </Sheet.Content>
            <Sheet.Footer>
              <Button variant={'ghost'} onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : 'Create'}
              </Button>
            </Sheet.Footer>
          </form>
        </Form>
      </Sheet.View>
    </Sheet>
  );
};
