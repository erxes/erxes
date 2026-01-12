import { Button, Form, Input, Sheet, Spinner } from 'erxes-ui';
import { SubmitHandler, useForm } from 'react-hook-form';
import { IPropertyGroupForm } from '../types/Properties';
import { zodResolver } from '@hookform/resolvers/zod';
import { propertyGroupSchema } from '../propertySchema';
import { useParams } from 'react-router-dom';
import { IconPencil, IconPlus } from '@tabler/icons-react';

export const PropertyGroupForm = ({
  isEdit,
  onSubmit,
  defaultValues,
  onCancel,
  loading,
}: {
  isEdit?: boolean;
  onSubmit: (data: IPropertyGroupForm) => void;
  loading: boolean;
  defaultValues: IPropertyGroupForm;
  onCancel: () => void;
}) => {
  const { type } = useParams<{ type: string }>();
  const form = useForm<IPropertyGroupForm>({
    resolver: zodResolver(propertyGroupSchema),
    defaultValues,
  });

  const submitHandler: SubmitHandler<IPropertyGroupForm> = (data) => {
    onSubmit(data);
  };

  return (
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
            Add a new group for the content type {type}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4 gap-5">
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
          <Button variant={'ghost'} onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : isEdit ? <IconPencil /> : <IconPlus />}
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
