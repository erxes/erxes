import { useAddFieldsGroupForm } from '@/settings/properties/hooks/useAddFieldsGroupForm';
import { IPropertyGroupForm } from '@/settings/properties/types';
import {
  Button,
  DropdownMenu,
  Form,
  Input,
  Sheet,
  Spinner,
  Switch,
} from 'erxes-ui';
import React from 'react';
import { SubmitHandler } from 'react-hook-form';

export const AddPropertyGroup = () => {
  const [loading] = React.useState<boolean>(false); // Replace with actual loading state if needed
  const { methods } = useAddFieldsGroupForm();
  const { handleSubmit } = methods;
  const [open, setOpen] = React.useState<boolean>(false);

  const submitHandler: SubmitHandler<IPropertyGroupForm> = React.useCallback(
    async (data) => {
      // Handle the form submission logic here
      console.log('Submitted data:', data);
      methods.reset();
      setOpen(false);
    },
    [methods],
  );

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <Sheet.Trigger asChild>
        <DropdownMenu.Item
          onClick={(e) => {
            e.preventDefault();
            setOpen(!open);
          }}
        >
          Add Group
        </DropdownMenu.Item>
      </Sheet.Trigger>
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Form {...methods}>
          <form
            onSubmit={handleSubmit(submitHandler)}
            className=" flex flex-col gap-0 w-full h-full"
          >
            <Sheet.Header>
              <Sheet.Title className="text-lg text-foreground flex items-center gap-1">
                Add Group
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4 gap-3">
              {/* Add your form fields here, for example: */}

              <Form.Field
                control={methods.control}
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
                control={methods.control}
                name="description"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Description</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter group description"
                        className="input"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={methods.control}
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
              <Form.Field
                control={methods.control}
                name="parentId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Parent Group</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter parent group ID"
                        className="input"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={methods.control}
                name="alwaysOpen"
                render={({ field }) => (
                  <Form.Item className='justify-between items-center flex'>
                    <Form.Label>Always Open</Form.Label>
                    <Form.Control>
                      <Switch
                        checked={field.value as boolean}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={methods.control}
                name="isMultiple"
                render={({ field }) => (
                  <Form.Item className='justify-between items-center flex'>
                    <Form.Label>Multiple</Form.Label>
                    <Form.Control>
                      <Switch
                        checked={field.value as boolean}
                        onCheckedChange={field.onChange}
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
