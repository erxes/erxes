import { useAddPropertyForm } from '@/settings/properties/hooks/useAddPropertyForm';
import { IPropertyForm } from '@/settings/properties/types';
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

export const AddProperty = () => {
  const [loading] = React.useState<boolean>(false); // Replace with actual loading state if needed
  const { methods } = useAddPropertyForm();
  const { handleSubmit } = methods;
  const [open, setOpen] = React.useState<boolean>(false);

  const submitHandler: SubmitHandler<IPropertyForm> = React.useCallback(
    async (data) => {
      // Handle the form submission logic here
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
          Add Property
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
                Add Property
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
                    <Form.Label>Property Name</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter property name"
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
                        placeholder="Enter property description"
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
                        placeholder="Enter property code"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={methods.control}
                name="groupId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Parent Group</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter parent group"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={methods.control}
                name="type"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Type</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        type="text"
                        placeholder="Enter type"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={methods.control}
                name="isSearchable"
                render={({ field }) => (
                  <Form.Item className="justify-between items-center flex">
                    <Form.Label>Searchable</Form.Label>
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
